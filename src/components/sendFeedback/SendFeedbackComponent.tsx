// - Import react components
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import SvgHappy from 'material-ui/svg-icons/image/tag-faces'
import SvgSad from 'material-ui/svg-icons/action/face'
import SvgClose from 'material-ui/svg-icons/content/clear'
import RefreshIndicator from 'material-ui/RefreshIndicator'

// - Import app components

// - Import API

// - Import actions
import { globalActions } from 'actions'

import { Feed } from 'core/domain/common'
import { ISendFeedbackComponentProps } from './ISendFeedbackComponentProps'
import { ISendFeedbackComponentState } from './ISendFeedbackComponentState'
import { FeedType } from 'core/domain/common/feedType'
import { ServerRequestModel } from 'models/server'
import { Profile } from 'core/domain/users'
import StringAPI from 'api/StringAPI'
import { ServerRequestType } from 'constants/serverRequestType'
import { User } from 'core/domain/users'
import { ServerRequestStatusType } from 'actions/serverRequestStatusType'

/**
 * Create component class
 */
export class SendFeedbackComponent extends Component<ISendFeedbackComponentProps, ISendFeedbackComponentState> {

  /**
   * Component constructor
   * @param  {object} props is an object properties of component
   */
  constructor(props: ISendFeedbackComponentProps) {
    super(props)

    // Defaul state
    this.state = {
      feedText: ''
    }

    // Binding functions to `this`
    this.handleFeedText = this.handleFeedText.bind(this)
    this.getFeedbackForm = this.getFeedbackForm.bind(this)
    this.mainForm = this.mainForm.bind(this)
    this.loadingForm = this.loadingForm.bind(this)
    this.successForm = this.successForm.bind(this)
    this.errorForm = this.errorForm.bind(this)
  }

  handleFeedText = (event: any) => {
    const target = event ? event.target : {}
    const value = target ? target.value : ''
    if (value) {
      this.setState({
        feedText: value
      })

    }
  }

  handleSendFeed = (feedType: FeedType) => {
    const { sendFeed, currentUser } = this.props
    const { feedText } = this.state
    sendFeed!(new Feed('', feedText, feedType, currentUser))
  }

  mainForm = () => {
    const { sendFeedbackStatus, hideFeedback, sendFeed, sendFeedbackRequest } = this.props
    const { feedText } = this.state
    return (
      <div>
        <TextField
          hintText='What do you feel?'
          multiLine={true}
          onChange={this.handleFeedText}
          rows={2}
          rowsMax={4}
        /><br />
        <div className='buttons'>
          <IconButton
            tooltip='sad'
            iconClassName='flaticon-sad-2 icon__svg'
            tooltipPosition='bottom-left'
            onClick={() => this.handleSendFeed(FeedType.Sad)}
          >
          </IconButton>
          <IconButton
            tooltip='acceptable'
            iconClassName='flaticon-neutral icon__svg'
            tooltipPosition='bottom-left'
            onClick={() => this.handleSendFeed(FeedType.Acceptable)}
          >
          </IconButton>
          <IconButton
            tooltip='happy'
            iconClassName='flaticon-happy-2 icon__svg'
            tooltipPosition='bottom-left'
            onClick={() => this.handleSendFeed(FeedType.Happy)}
          >
          </IconButton>
          <IconButton
            tooltip='awesome'
            iconClassName='flaticon-happy icon__svg'
            tooltipPosition='bottom-left'
            onClick={() => this.handleSendFeed(FeedType.Awesome)}
          >
          </IconButton>

        </div>
      </div >)
  }

  loadingForm = () => {
    return (<div className='loading'>
    <p>
          Your feedback is sending!
      </p>
      <div className='icon'>
        <RefreshIndicator
          size={50}
          left={70}
          top={0}
          status='loading'
        />
        
      </div>
    </div>)
  }

  successForm = () => {
    return (<div className='success'>We appreciate your kind support as always ;)</div>)
  }

  errorForm = () => {
    return (<div className='error'>Error in sending feedback :(</div>)
  }

  getFeedbackForm = () => {
    const { sendFeedbackStatus, hideFeedback, sendFeed, sendFeedbackRequest } = this.props
    const { feedText } = this.state

    if (sendFeedbackRequest) {
      switch (sendFeedbackRequest.status) {
        case ServerRequestStatusType.Sent:
          return this.loadingForm()

        case ServerRequestStatusType.OK:
          return this.successForm()

        case ServerRequestStatusType.Error:
          return this.errorForm()

        default:
          return this.mainForm()
      }
    } else {
      return this.mainForm()
    }
  }

  /**
   * Reneder component DOM
   * @return {react element} return the DOM which rendered by component
   */
  render() {
    const { sendFeedbackStatus, hideFeedback, sendFeed, sendFeedbackRequest } = this.props
    const { feedText } = this.state

    return (
      <div className='sendFeedback__content animate__up' style={{ display: (sendFeedbackStatus ? 'block' : 'none') }}>
        <Paper className='paper' >
          <div className='close'>
            <IconButton
              tooltip='cancel'
              tooltipPosition='bottom-left'
              onClick={() => hideFeedback()}
            >
              <SvgClose />
            </IconButton>
          </div>
          {this.getFeedbackForm()}

        </Paper>
      </div>
    )
  }
}

/**
 * Map dispatch to props
 * @param  {func} dispatch is the function to dispatch action to reducers
 * @param  {object} ownProps is the props belong to component
 * @return {object}          props of component
 */
const mapDispatchToProps = (dispatch: Function, ownProps: ISendFeedbackComponentProps) => {
  return {
    sendFeed: (feed: Feed) => (dispatch(globalActions.dbSendFeed(feed))),
    hideFeedback: () => dispatch(globalActions.hideSendFeedback())
  }
}

/**
 * Map state to props
 * @param  {object} state is the obeject from redux store
 * @param  {object} ownProps is the props belong to component
 * @return {object}          props of component
 */
const mapStateToProps = (state: any, ownProps: ISendFeedbackComponentProps) => {

  const { server, global, authorize, user } = state
  const { request } = server
  const { uid } = authorize
  const currentUser: User = user.info && user.info[uid] ? { ...user.info[uid], userId: uid } : {}
  const { sendFeedbackStatus } = global
  const sendFeedbackRequest: ServerRequestModel = request ? request[StringAPI.createServerRequestId(ServerRequestType.CommonSendFeedback, uid)] : null

  return {
    sendFeedbackStatus,
    sendFeedbackRequest,
    currentUser
  }
}

// - Connect component to redux store
export default connect(mapStateToProps, mapDispatchToProps)(SendFeedbackComponent as any)
