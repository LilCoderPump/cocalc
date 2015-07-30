###############################################################################
#
# SageMathCloud: A collaborative web-based interface to Sage, IPython, LaTeX and the Terminal.
#
#    Copyright (C) 2015, William Stein
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################


# At most this many of the most recent log messages for a project get loaded:
MAX_PROJECT_LOG_ENTRIES = 5000

misc = require('misc')
underscore = require('underscore')
async = require('async')
immutable  = require('immutable')
{salvus_client} = require('salvus_client')
{defaults, required} = misc

{Actions, Store, Table}  = require('flux')

masked_file_exts =
    'py'   : ['pyc']
    'java' : ['class']
    'cs'   : ['exe']
    'tex'  : 'aux bbl blg fdb_latexmk glo idx ilg ind lof log nav out snm synctex.gz toc xyc'.split(' ')

BAD_FILENAME_CHARACTERS = '\\/'
BAD_LATEX_FILENAME_CHARACTERS = '\'"()"~%'
BANNED_FILE_TYPES = ['doc', 'docx', 'pdf', 'sws']

FROM_WEB_TIMEOUT_S = 45


QUERIES =
    project_log :
        query :
            project_id : null
            account_id : null
            time       : null  # if we wanted to only include last month.... time       : -> {">=":misc.days_ago(30)}
            event      : null
        options : [{order_by:'-time'}, {limit:MAX_PROJECT_LOG_ENTRIES}]

must_define = (flux) ->
    if not flux?
        throw 'you must explicitly pass a flux object into each function in project_store'

# Define user actions
key = (project_id, name) -> "project-#{project_id}-#{name}"

exports.getStore = getStore = (project_id, flux) ->
    must_define(flux)
    name = key(project_id, '')
    store = flux.getStore(name)
    if store?
        return store

    class ProjectActions extends Actions

        setTo : (payload) =>
            payload

        _project : =>
            return require('project').project_page(project_id:project_id)

        _ensure_project_is_open : (cb) =>
            s = flux.getStore('projects')
            if not s.is_project_open(project_id)
                flux.getActions('projects').open_project(project_id:project_id)
                s.wait_until_project_is_open(project_id, 30, cb)
            else
                cb()

        clear_all_activity : =>
            @setTo(activity:undefined)

        set_next_default_filename : (next) =>
            @setTo(default_filename:next)

        set_activity : (opts) =>
            opts = defaults opts,
                id     : required     # client must specify this, e.g., id=misc.uuid()
                start  : undefined    # this activity started -- give a description of what is happening here
                stop   : undefined    # activity is done  -- give true
                status : undefined    # status update message during the activity -- description of progress
                error  : undefined    # describe an error that happened
            x = store.get_activity()
            if not x?
                x = {}
            # Actual implemenation of above specified API is VERY minimal for
            # now -- just enough to display something to user.
            if opts.start?
                x[opts.id] = opts.start
                @setTo(activity: x)
            if opts.status?
                x[opts.id] = opts.status
                @setTo(activity: x)
            if opts.error?
                error = opts.error
                if error == ''
                    @setTo(error:error)
                else
                    @setTo(error:((store.state.error ? '') + '\n' + error).trim())
            if opts.stop?
                delete x[opts.id]
                @setTo(activity: x)
            return

        # report a log event to the backend -- will indirectly result in a new entry in the store...
        log : (event) =>
            require('salvus_client').salvus_client.query
                query :
                    project_log :
                        project_id : project_id
                        time       : new Date()
                        event      : event
                cb : (err) =>
                    if err
                        # TODO: what do we want to do if a log doesn't get recorded?
                        console.log('error recording a log entry: ', err)

        open_file : (opts) =>
            opts = defaults opts,
                path       : required
                foreground : true      # display in foreground as soon as possible
                chat       : false
            @_ensure_project_is_open (err) =>
                if err
                    @set_activity(id:misc.uuid(), error:"opening file -- #{err}")
                else
                    # TEMPORARY -- later this will happen as a side effect of changing the store...
                    @_project().open_file(path:opts.path, foreground:opts.foreground)
                    if opts.chat
                        console.log('opts.chat = ', opts.chat)
                        @_project().show_editor_chat_window(opts.path)

        foreground_project : =>
            @_ensure_project_is_open (err) =>
                if err
                    # TODO!
                    console.log('error putting project in the foreground: ', err, project_id, path)
                else
                    flux.getActions('projects').foreground_project(project_id)

        open_directory : (path) =>
            @_ensure_project_is_open (err) =>
                if err
                    # TODO!
                    console.log('error opening directory in project: ', err, project_id, path)
                else
                    @foreground_project()
                    @set_current_path(path)
                    @set_focused_page('project-file-listing')

        set_focused_page : (page) =>
            # TODO: temporary -- later the displayed tab will be stored in the store *and* that will
            # influence what is displayed
            @_project().display_tab(page)

        set_current_path : (path)=>
            # Set the current path for this project. path is either a string or array of segments.
            p = @_project()
            v = p._parse_path(path)
            if not underscore.isEqual(path, p.current_path)
                p.current_path = v
                @setTo(current_path: v[..])
                @set_directory_files(v)
                @clear_all_checked_files()

        set_directory_files : (path, sort_by_time, show_hidden) ->
            path ?= (store.state.current_path ? [])
            sort_by_time ?= (store.state.sort_by_time ? true)
            show_hidden  ?= (store.state.show_hidden ? false)
            require('salvus_client').salvus_client.project_directory_listing
                project_id : project_id
                path       : path.join('/')
                time       : sort_by_time
                hidden     : show_hidden
                timeout    : 10
                cb         : (err, listing) =>
                    if not store.state.directory_file_listing?
                        map = immutable.Map()
                    else
                        map = store.state.directory_file_listing
                    if err
                        map = map.set(path.join('/'), err)
                    else
                        map = map.set(path.join('/'), immutable.fromJS(listing.files))
                        @setTo(checked_files : store.state.checked_files.intersect(file.name for file in listing.files))
                    @setTo(directory_file_listing : map)

        set_file_checked : (file, checked) ->
            if checked
                checked_files = store.state.checked_files.add(file)
            else
                checked_files = store.state.checked_files.delete(file)

            @setTo(checked_files : checked_files, file_action : undefined)

        set_all_checked_files : (file_list) ->
            @setTo(checked_files : store.state.checked_files.union(file_list))

        clear_all_checked_files : ->
            @setTo(checked_files : store.state.checked_files.clear(), file_action : undefined)

        set_file_action : (action) ->
            @setTo(file_action : action)

        ensure_directory_exists : (opts)=>
            #Temporary: call from project page
            @_project().ensure_directory_exists(opts)

        get_from_web : (opts)=>
            #Temporary: call from project page
            @_project().get_from_web(opts)

        create_editor_tab : (opts) =>
            @_project().editor.create_tab(opts)

        display_editor_tab : (opts) =>
            @_project().editor.display_tab(opts)

        # function used internally by things that call salvus_client.exec
        _finish_exec : (id) =>
            # returns a function that takes the err and output and does the right activity logging stuff.
            return (err, output) =>
                @set_directory_files()
                if err
                    @set_activity(id:id, error:err)
                else if output?.event == 'error' or output?.error
                    @set_activity(id:id, error:output.error)
                @set_activity(id:id, stop:'')

        zip_files : (opts) ->
            opts = defaults opts,
                src      : required
                dest     : required
                zip_args : undefined
                path     : undefined   # default to root of project
                id       : undefined
            id = opts.id ? misc.uuid()
            @set_activity(id:id, start:"Creating #{opts.dest} from #{opts.src.length} #{misc.plural(opts.src.length, 'file')}")
            args = (opts.zip_args ? []).concat(['-r'], [opts.dest], opts.src)
            salvus_client.exec
                project_id      : project_id
                command         : 'zip'
                args            : args
                timeout         : 50
                network_timeout : 60
                err_on_exit     : true    # this should fail if exit_code != 0
                path            : opts.path
                cb              : @_finish_exec(id)

        copy_files : (opts) ->
            opts = defaults opts,
                src  : required
                dest : required
                id   : undefined
            id = opts.id ? misc.uuid()
            @set_activity(id:id, start:"Copying #{opts.src.length} #{misc.plural(opts.src.length, 'file')} to #{opts.dest}")
            salvus_client.exec
                project_id      : project_id
                command         : 'rsync'  # don't use "a" option to rsync, since on snapshots results in destroying project access!
                args            : ['-rltgoDxH', '--backup', '--backup-dir=.trash/', opts.src, opts.dest]
                timeout         : 120   # how long rsync runs on client
                network_timeout : 120   # how long network call has until it must return something or get total error.
                err_on_exit     : true
                path            : '.'
                cb              : @_finish_exec(id)

        copy_paths_between_projects: (opts) =>
            opts = defaults opts,
                public            : false
                src_project_id    : required    # id of source project
                src               : required    # list of relative paths of directors or files in the source project
                target_project_id : required    # if of target project
                target_path       : undefined   # defaults to src_path
                overwrite_newer   : false       # overwrite newer versions of file at destination (destructive)
                delete_missing    : false       # delete files in dest that are missing from source (destructive)
                backup            : false       # make ~ backup files instead of overwriting changed files
                timeout           : undefined   # how long to wait for the copy to complete before reporting "error" (though it could still succeed)
                exclude_history   : false       # if true, exclude all files of the form *.sage-history
                id                : undefined
            # TODO: wrote this but *NOT* tested yet -- needed "copy_click".
            id = opts.id ? misc.uuid()
            @set_activity(id:id, start:"Copying #{opts.src.length} #{misc.plural(opts.src.length, 'path')} to another project")
            src = opts.src
            f = (src_path, cb) ->
                opts.cb = cb
                opts.src_path = src_path
                salvus_client.exec(opts)
            async.mapLimit(src, 3, f, @_finish_exec(id))

        _move_files : (opts) ->  #PRIVATE -- used internally to move files
            opts = defaults opts,
                src     : required
                dest    : required
                path    : undefined   # default to root of project
                mv_args : undefined
                cb      : required
            salvus_client.exec
                project_id      : project_id
                command         : 'mv'
                args            : (opts.mv_args ? []).concat(['--'], opts.src, [opts.dest])
                timeout         : 15      # move should be fast..., unless across file systems.
                network_timeout : 20
                err_on_exit     : true    # this should fail if exit_code != 0
                path            : opts.path
                cb              : opts.cb

        move_files : (opts) ->
            opts = defaults opts,
                src     : required
                dest    : required
                path    : undefined   # default to root of project
                mv_args : undefined
                id      : undefined
            id = opts.id ? misc.uuid()
            @set_activity(id:id, start: "Moving #{opts.src.length} #{misc.plural(opts.src.length, 'file')} to #{opts.dest}")
            delete opts.id
            opts.cb = (err) =>
                if err
                    @set_activity(id:id, error:err)
                @set_activity(id:id, stop:'')
            @_move_files(opts)

        trash_files: (opts) ->
            opts = defaults opts,
                src  : required
                path : undefined
                id   : undefined
            id = opts.id ? misc.uuid()
            @set_activity(start: "Moving #{opts.src.length} #{misc.plural(opts.src.length, 'file')} to the trash", id:id)
            async.series([
                (cb) =>
                    @ensure_directory_exists(path:'.trash', cb:cb)
                (cb) =>
                    @_move_files(src:opts.src, path:opts.path, dest:'.trash', cb:cb, mv_args:['--backup=numbered'])
            ], (err) =>
                @set_activity(id:id, stop:'')
                if err
                    @set_activity(id:id, error:"problem trashing #{misc.to_json(opts.src)} -- #{err}")
                else
                    @log(event:"file_action", action:"delete", files:opts.src[0...3], count: if opts.src.length > 3 then opts.src.length)
                @set_directory_files()   # TODO: not solid since you may have changed directories. -- won't matter when we have push events for the file system, and if you have moved to another directory then you don't care about this directory anyways.
            )

        delete_files : (opts) ->
            opts = defaults opts,
                paths : required
            if opts.paths.length == 0
                return
            id = misc.uuid()
            if underscore.isEqual(opts.paths, ['.trash'])
                mesg = "the trash"
            else if opts.paths.length == 1
                mesg = "#{opts.paths[0]}"
            else
                mesg = "#{opts.paths.length} files"
            @set_activity(id:id, start: "Deleting #{mesg}")
            salvus_client.exec
                project_id : project_id
                command    : 'rm'
                timeout    : 60
                args       : ['-rf'].concat(opts.paths)
                cb         : (err, result) =>
                    if err
                        @set_activity(id:id, error: "Network error while trying to delete #{mesg} -- #{err}", stop:'')
                    else if result.event == 'error'
                        @set_activity(id:id, error: "Error deleting #{mesg} -- #{result.error}", stop:'')
                    else
                        @set_activity(id:id, status:'Successfully deleted #{mesg}.', stop:'')


        download_file : (opts) ->
            @_project().download_file(opts)


        path : (name, current_path, ext, on_empty) ->
            if name.length == 0
                if on_empty?
                    on_empty()
                    return ''
                name = require('account').default_filename()
            for bad_char in BAD_FILENAME_CHARACTERS
                if name.indexOf(bad_char) != -1
                    on_error("Cannot use '#{bad_char}' in a filename")
                    return ''
            dir = misc.path_join(current_path, '')
            s = dir + name
            if ext? and misc.filename_extension(s) != ext
                s = "#{s}.#{ext}"
            return s

        create_folder : (name, current_path) ->
            p = @path(name, current_path)
            if p.length == 0
                return
            @ensure_directory_exists
                path : p
                cb   : (err) =>
                    if not err
                        #TODO alert
                        @set_focused_page('project-file-listing')

        create_file : (opts) ->
            opts = defaults opts,
                name         : undefined
                ext          : undefined
                current_path : undefined
                on_download  : undefined
                on_error     : undefined
                on_empty     : undefined

            name = opts.name
            if name.indexOf('://') != -1 or misc.startswith(name, 'git@github.com')
                opts.on_download?(true)
                @new_file_from_web name, opts.current_path, () =>
                    opts.on_download?(false)
                return
            if name[name.length - 1] == '/'
                for bad_char in BAD_FILENAME_CHARACTERS
                    if name.slice(0, -1).indexOf(bad_char) != -1
                        opts.on_error?("Cannot use '#{bad_char}' in a folder name")
                        return
                @create_folder(name, opts.current_path)
                return
            p = @path(name, opts.current_path,  opts.ext, opts.on_empty)
            if not p
                return
            ext = misc.filename_extension(p)
            if ext in BANNED_FILE_TYPES
                opts.on_error?("Cannot create a file with the #{ext} extension")
                return
            if ext == 'tex'
                for bad_char in BAD_LATEX_FILENAME_CHARACTERS
                    if p.indexOf(bad_char) != -1
                        opts.on_error?("Cannot use '#{bad_char}' in a LaTeX filename")
                        return
            if p.length == 0
                return
            salvus_client.exec
                project_id  : project_id
                command     : 'new-file'
                timeout     : 10
                args        : [p]
                err_on_exit : true
                cb          : (err, output) =>
                    if err
                        opts.on_error?("#{output?.stdout ? ''} #{output?.stderr ? ''} #{err}")
                    else
                        @set_focused_page('project-editor')
                        tab = actions.create_editor_tab(filename:p, content:'')
                        actions.display_editor_tab(path: p)

        new_file_from_web : (url, current_path, cb) ->
            d = misc.path_join(current_path, 'root of project')
            id = misc.uuid()
            @set_activity
                id:id
                status:"Downloading '#{url}' to '#{d}', which may run for up to #{FROM_WEB_TIMEOUT_S} seconds..."
            @get_from_web
                url     : url
                dest    : current_path
                timeout : FROM_WEB_TIMEOUT_S
                alert   : true
                cb      : (err) =>
                    @set_activity(id: id, stop:'')
                    cb?(err)

        # If path_map = {'foo':'bar', 'a/x.txt':'blah', 'z':undefined}
        # then foo will get displayed as bar in directory listings, a/x.txt
        # will get displayed as a/blah and if z was set from a previous call,
        # it will be removed.
        #set_display_names: (path_map) ->
             #TODO

    class ProjectStore extends Store
        constructor: (flux) ->
            super()
            ActionIds = flux.getActionIds(name)
            @register(ActionIds.setTo, @setTo)
            @state =
                current_path  : []
                sort_by_time  : true #TODO
                show_hidden   : false
                checked_files : immutable.Set()

        setTo: (payload) ->
            @setState(payload)

        get_activity: => @state.activity

        _match : (words, s, is_dir) ->
            s = s.toLowerCase()
            for t in words
                if t == '/'
                    if not is_dir
                        return false
                else if s.indexOf(t) == -1
                    return false
            return true

        _matched_files : (search, listing) ->
            if not listing?
                return []
            words = search.split(" ")
            return (x for x in listing when @_match(words, x.name, x.isdir))

        _compute_file_masks: (listing) ->
            filename_map = misc.dict([item.name, item] for item in listing) # map filename to file
            for file in listing
                filename = file.name

                # mask items beginning with '.'
                if misc.startswith(filename, '.')
                    file.mask = true
                    continue

                # mask compiled files, e.g. mask 'foo.class' when 'foo.java' exists
                ext = misc.filename_extension(filename)
                basename = filename[0...filename.length - ext.length]
                for mask_ext in masked_file_exts[ext] ? [] # check each possible compiled extension
                    filename_map["#{basename}#{mask_ext}"]?.mask = true

        _compute_snapshot_display_names: (listing) ->
            for item in listing
                item.display_name = "#{misc.parse_bup_timestamp(item.name)}"

        get_displayed_listing: =>
            # cached pre-processed file listing, which should always be up to date when called, and properly
            # depends on dependencies.
            # TODO: optimize -- use immutable js and cache result if things haven't changed. (like shouldComponentUpdate)
            # **ensure** that cache clearing depends on account store changing too, as in file_use.coffee.
            path = @state.current_path.join('/')
            listing = @state.directory_file_listing?.get(path)
            if typeof(listing) == 'string'
                if listing.indexOf('no such path') != -1
                    return {error:"nodir"}
                else
                    return {error:listing}
            if not listing?
                return {}
            listing = listing.toJS()
            search = @state.file_search
            if search
                listing = @_matched_files(search, listing)

            # TODO: make this store update when account store updates.
            if flux.getStore('account')?.state?.other_settings?.mask_files
                @_compute_file_masks(listing)

            if path == '.snapshots'
                @_compute_snapshot_display_names(listing)

            return {listing: listing}

    actions    = flux.createActions(name, ProjectActions)
    store      = flux.createStore(name, ProjectStore, flux)
    store.name = name
    queries    = misc.deep_copy(QUERIES)

    create_table = (table_name, q) ->
        class P extends Table
            query: =>
                return "#{table_name}":q.query
            options: =>
                return q.options
            _change: (table, keys) =>
                actions.setTo("#{table_name}": table.get())

    for table_name, q of queries
        for k, v of q
            if typeof(v) == 'function'
                q[k] = v()
        q.query.project_id = project_id
        T = flux.createTable(key(project_id, table_name), create_table(table_name, q))

    return store

exports.getActions = (project_id, flux) ->
    must_define(flux)
    if not getStore(project_id, flux)?
        getStore(project_id, flux)
    return flux.getActions(key(project_id,''))

exports.getTable = (project_id, name, flux) ->
    must_define(flux)
    if not getStore(project_id, flux)?
        getStore(project_id, flux)
    return flux.getTable(key(project_id, name))

exports.deleteStoreActionsTable = (project_id, flux) ->
    must_define(flux)
    name = key(project_id, '')
    flux.removeStore(name)
    flux.removeActions(name)
    flux.removeAllListeners(name)
    for table,_ of QUERIES
        flux.removeTable(key(project_id, table))
