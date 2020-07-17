#########################################################################
# This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
# License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
#########################################################################

support_rewrite = require('./support/index-rename')

$          = window.$
underscore = _ = require('underscore')
{React, ReactDOM, Actions, Store, rtypes, rclass, redux, COLOR}  = require('./app-framework')
{Button, FormControl, FormGroup, Well, Alert, Modal, Table} = require('react-bootstrap')
{Icon, Markdown, Loading, Space, ImmutablePureRenderMixin, A} = require('./r_misc')
misc            = require('smc-util/misc')
misc_page       = require('./misc_page')
{webapp_client} = require('./webapp-client')
feature         = require('./feature')
{HelpEmailLink, SiteName, Footer} = require('./customize')
{DISCORD_INVITE} = require('smc-util/theme')
{delay} = require('awaiting')

STATE =
    NEW        : 'new'      # new/default/resetted/no problem
    CREATING   : 'creating' # loading ...
    CREATED    : 'created'  # ticket created
    ERROR      : 'error'    # there was a problem

date2str = (d) ->
    try
        if _.isString(d)
            d = new Date(d)
        dstr = d.toISOString().slice(0, 10)
        tstr = d.toLocaleTimeString()
        return "#{dstr} #{tstr}"
    catch e
        console.warn("support/date2str: could not convert #{d}")
        return '?'

exports.SupportPage = rclass
    displayName : "SupportPage"

    reduxProps :
        support:
            support_tickets      : rtypes.immutable.List
            support_ticket_error : rtypes.string

    render_header: ->
        <tr style={fontWeight:"bold"}>
            <th>Ticket</th>
            <th>Status</th>
        </tr>

    open: (ticket_id) ->
        url = misc.ticket_id_to_ticket_url(ticket_id)
        {open_new_tab} = require('smc-webapp/misc_page')
        open_new_tab(url, '_blank')

    render_body: ->
        for i, ticket of @props.support_tickets.toJS()
            do (ticket, i) =>
                style = switch ticket.status
                    when 'open', 'new'
                        'danger'
                    when 'closed'
                        'info'
                    when 'solved'
                        'success'
                    else
                        'info'

                <tr key={i} className="#{style}">
                    <td><h4>{ticket.subject}</h4>
                        <div style={fontSize:"85%", color:'#555', marginBottom: '1em'}>
                            created: {date2str(ticket.created_at)},
                            {' '}
                            last update: {date2str(ticket.updated_at)}
                        </div>
                        <div style={maxHeight:"10em", "overflowY":"auto"}>
                            <Markdown value={ticket.description} />
                        </div>
                    </td>
                    <td>
                        <br/>
                        <Button bsStyle="#{style}"
                            onClick={=> @open(ticket.id)}>
                            {ticket.status.toUpperCase()}
                            <br/>
                            Go to {ticket.id}
                        </Button>
                    </td>
                </tr>

    load_support_tickets_soon: -> # see https://github.com/sagemathinc/cocalc/issues/4520
        await delay(1)
        redux.getActions('support').load_support_tickets()


    render_table: ->
        divStyle = {textAlign:"center", marginTop: "4em"}

        if not @props.support_tickets?
            @load_support_tickets_soon()
            return <div style={divStyle}>
                        <Loading />
                   </div>

        if @props.support_tickets.size > 0
            <Table responsive style={borderCollapse: "separate", borderSpacing: "0 1em"}>
                <tbody>{@render_body()}</tbody>
            </Table>
        else
            <div style={divStyle}>
                No support tickets found.
            </div>

    render: ->
        if @props.support_ticket_error?.length > 0
            content = <Alert bsStyle='danger'>
                          Error retriving tickets: {@props.support_ticket_error}
                          <br/>
                          Please contact <HelpEmailLink /> directly!
                      </Alert>
        else
            content = @render_table()

        <div>
            <h2>Support tickets</h2>
            <div style={color:'#666'}>
                Check the status of your support tickets here.<br/>
                To report an issue, navigate to the file in question
                and click the <Icon name='medkit' /> button in the top right corner.
            </div>
            <div style={minHeight:"65vh"}>
                {content}
            </div>
            <Footer/>
        </div>

SupportInfo = support_rewrite.SupportInfo;

SupportFooter = support_rewrite.SupportFooter;


SupportForm = support_rewrite.SupportForm;


exports.Support = rclass
    displayName : 'Support-main'

    propTypes :
        actions : rtypes.object.isRequired

    getDefaultProps: ->
        show        : false
        email       : ''
        subject     : ''
        body        : ''
        state       : STATE.NEW
        url         : ''
        err         : ''
        email_err   : ''
        valid       : false

    reduxProps :
        support:
            show         : rtypes.bool
            email        : rtypes.string
            subject      : rtypes.string
            body         : rtypes.string
            state        : rtypes.string
            url          : rtypes.string
            err          : rtypes.string
            email_err    : rtypes.string
            valid        : rtypes.bool
            project_title : rtypes.string
        account:
            is_anonymous : rtypes.bool

    componentDidMount: ->
        @props.actions.check_valid()

    componentWillReceiveProps: (newProps) ->
        newProps.actions.check_valid()

    open: ->
        @props.actions.show(true)

    close: ->
        @props.actions.show(false)

    submit: (event) ->
        event?.preventDefault()
        @props.actions.support()

    show_account: ->
        @close()
        redux.getActions('page').set_active_tab('account')

    render_form: (show_form)->
        if @props.is_anonymous
            return <h3>In order to create a support ticket first <a onClick={=>@show_account()}>create an account...</a></h3>
        else
            <SupportForm />

    render_info: ->
        <SupportInfo />

    render_body: (show_form) ->
        <div style={color:'#333'}>
            {@render_info()}
            {@render_form(show_form)}
        </div>


    render: () ->
        show_form = false

        if (not @props.state?) or @props.state == STATE.NEW
            show_form = true

        <Modal bsSize={"large"} show={@props.show} onHide={@close} animation={false}>
            <Modal.Header closeButton>
                <Modal.Title><Icon name='medkit' /> Help</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {@render_body(show_form)}
            </Modal.Body>

            <SupportFooter />
        </Modal>

# project wide public API

exports.ShowSupportLink = support_rewrite.ShowSupportLink;
