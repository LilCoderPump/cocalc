###
Evaluation of code with streaming output built on both the clients and
server (local hub) using a sync_table.  This evaluator is associated
to a syncstring editing session, and provides code evaluation that
may be used to enhance the experience of document editing.
###

diffsync = require('./diffsync')
misc     = require('./misc')

{defaults, required} = misc

class exports.Evaluator
    constructor: (@string, cb) ->
        query =
            eval_inputs :
                id    : [@string._string_id, misc.seconds_ago(30)]
                input : null
        @_inputs = @string._client.sync_table(query, {}, 1)

        query =
            eval_outputs :
                id    : [@string._string_id, misc.seconds_ago(30)]
                output : null
        @_outputs = @string._client.sync_table(query, {}, 1)
        @_outputs.setMaxListeners(100)  # in case of many evaluations at once.

        if @string._client.is_project()
            @_init_project_evaluator()

        cb?()  # not really async for now.

    close: () =>
        @_closed = true
        @_inputs?.close()
        delete @_inputs
        @_outputs?.close()
        delete @_outputs
        @_sage_session?.close()
        delete @_sage_session

    call: (opts) =>
        opts = defaults opts,
            program : required    # 'sage', 'bash'
            input   : required    # object whose meaning depends on the program
            cb      : undefined
        if @_closed
            opts.cb?("closed")
            return
        time = @string._client.server_time()  # TODO: need to perturb time if same as last eval
        @_inputs.set
            id    : [@string._string_id, time, 0]
            input : misc.copy_without(opts, 'cb')
        if opts.cb?
            # if we care about the output, listen for it until receving a mesg.done
            handle_output = (keys) =>
                for key in keys
                    t = misc.from_json(key)
                    if t[1] - time == 0  # we call opts.cb on all output with the given timestamp
                        mesg = @_outputs.get(key)?.get('output')?.toJS()
                        if mesg?
                            if mesg.done
                                @_outputs.removeListener('change', handle_output)
                            opts.cb(mesg)
            @_outputs.on('change', handle_output)

    _execute_code_hook: (output_uuid) =>
        dbg = @string._client.dbg("_execute_code_hook('#{output_uuid}')")
        dbg()
        if @_closed
            dbg("closed")
            return

        output_line = diffsync.MARKERS.output
        process = (mesg) =>
            dbg("processing mesg '#{misc.to_json(mesg)}'")
            content = @string.get()
            i = content.indexOf(diffsync.MARKERS.output + output_uuid)
            if i == -1
                # no cell anymore -- do nothing further
                process = undefined
                return
            i += 37
            n = content.indexOf('\n', i)
            if n == -1   # corrupted
                return
            output_line += misc.to_json(misc.copy_without(mesg, ['event'])) + diffsync.MARKERS.output
            #winston.debug("sage_execute_code: i=#{i}, n=#{n}, output_line.length=#{output_line.length}, output_line='#{output_line}'")
            if output_line.length > n - i
                #winston.debug("sage_execute_code: initiating client didn't maintain sync promptly. fixing")
                x = content.slice(0, i)
                content = x + output_line + content.slice(n)
                if mesg.done
                    j = x.lastIndexOf(diffsync.MARKERS.cell)
                    if j != -1
                        j = x.lastIndexOf('\n', j)
                        cell_id = x.slice(j+2, j+38)
                        #dbg("removing a cell flag: before='#{content}', cell_id='#{cell_id}'")
                        S = sagews(content)
                        S.remove_cell_flag(cell_id, diffsync.FLAGS.running)
                        content = S.content
                        #dbg("removing a cell flag: after='#{content}'")
                @string.set(content)
                @string.save()

        hook = (mesg) =>
            setTimeout((=>process?(mesg)), 5000)
        return hook

    _handle_input_change: (key) =>
        dbg = @string._client.dbg('_handle_input_change')
        dbg("change: #{key}")
        if @_closed
            dbg("closed")
            return
        t = misc.from_json(key)
        id = [t[0], t[1], 0]
        if not @_outputs.get(JSON.stringify(id))?
            dbg("no outputs with key #{misc.to_json(id)}")
            x = @_inputs.get(key)?.get('input')?.toJS?()  # could be deleting a key!
            if not x?
                return
            if x.program? and x.input?
                f = @["_evaluate_using_#{x.program}"]
                if f?
                    if x.input.event == 'execute_code' and x.input.output_uuid?
                        hook = @_execute_code_hook(x.input.output_uuid)
                    f x.input, (output) =>
                        #dbg("got output='#{misc.to_json(output)}'; id=#{misc.to_json(id)}")
                        hook?(output)
                        @_outputs.set({id:id, output:output})
                        id[2] += 1
                else
                    @_outputs.set({id:id, output:misc.to_json({error:"no program '#{x.program}'", done:true})})
            else
                @_outputs.set({id:id, output:misc.to_json({error:"must specify program and input", done:true})})


    # Runs only in the project
    _init_project_evaluator: () =>
        dbg = @string._client.dbg('project_evaluator')
        dbg('init')
        @_inputs.on 'change', (keys) =>
            for key in keys
                @_handle_input_change(key)

    # Runs only in the project
    _evaluate_using_sage: (input, cb) =>
        @_sage_session ?= @string._client.sage_session(path : misc.path_split(@string._path).head)
        # TODO: input also may have -- uuid, output_uuid, timeout
        if input.event == 'execute_code'
            input = misc.copy_with(input, ['code', 'data', 'preparse', 'event', 'id'])
        @_sage_session.call
            input : input
            cb    : cb

    # Runs only in the project
    _evaluate_using_shell: (input, cb) =>
        input.cb = (err, output) =>
            if not output?
                output = {}
            if err
                output.error = err
            output.done = true
            cb(output)
        @string._client.shell(input)
