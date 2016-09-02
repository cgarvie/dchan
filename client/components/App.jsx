import React, {Component} from 'react';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';



import ThreadSection from './threads/ThreadSection.jsx';
import UserSection from './users/UserSection.jsx';
import MessageSection from './messages/MessageSection.jsx';
import NavSection from './navbar/NavSection.jsx';
import AlertBar from './snackbar/Alert.jsx';
import AuthModal from './modals/AuthModal.jsx';

import Socket from '../socket.js';
import cookie from 'react-cookie';

function isEmpty( obj ) { 
  for ( var prop in obj ) { 
    return false; 
  } 
  return true; 
}

//

class App extends Component{


  constructor(props){
    super(props);

    
    this.state = {
      channels: [],
      users: [],
      activeSessions: [], // both BrowserSessions and UserAccountSessions
      /*
      threads: [{channelId: "fsdfdsf",
                id: "fdsfdsf",
                lastBump: "",
                name: "sample thread"}],
      */
      threads: [],
      messages: [],
      activeChannel: {},
      activeThread: {},
      connected: false,
      warningAlert: "",

      userId: cookie.load('userId'),
      userSessionKey: cookie.load('userSessionKey')
    };


  }

/*
  getChildContext() { 
    return {
      muiTheme: getMuiTheme({
        palette: {
          accent1Color: deepOrange500,
        }
      })
    }
  }
*/

  OpenAuthModal() {
    this.refs.authModal.triggerDialog();
  }
  LoginUser(username, password){
    this.socket.emit('user login', {UserName: username, 
                                    PasswordHash: password});
  }
  RegisterUser(username, password){
    this.socket.emit('user register', {UserName: username, 
                                      PasswordHash: password});
  }

  onAlert(msg) {
    let {warningAlert} = this.state;
    console.log("JUST GOT THE FOLLOWING ERROR");
    console.log(msg)
    console.log("^^^")
    this.setState({ warningAlert: msg })
    console.log("in App, warningAlert =", this.state.warningAlert)
    this.refs.snackbar.openAlert()
  }
  
  onLogin(sess) {
    let {userId, userSessionKey} = this.state;
    console.log("successfully logged in!");
    console.log(sess)
    console.log("^^^")
    cookie.save('userId', sess.UserId, { path: '/' });
    cookie.save('userSessionKey', sess.SessionKey, { path: '/' });
    this.setState({ userId: sess.UserId, 
                    userSessionKey: sess.SessionKey });
  }

  LogoutUser() {
    let {userId, userSessionKey} = this.state;
    console.log("logging out via clearing cookies.");
    cookie.save('userId', '', { path: '/' });
    cookie.save('userSessionKey', '', { path: '/' });
    this.setState({ userId: '', 
                    userSessionKey: '' });
    //
    this.socket.emit('user logout', {}); // is this second argument optional?
  }
  /*
  onLogout() {
    cookie.remove('userId', { path: '/' });
    cookie.remove('userSessionKey', { path: '/' });
    //Object.keys(cookie.select().forEach(name => cookie.remove(name, { path: '/' }))
  }
  */

  componentWillMount(){
   
  }

  componentDidMount(){
    let ws = new WebSocket('ws://localhost:4000')
    let socket = this.socket = new Socket(ws); 
    socket.on('connect', this.onConnect.bind(this));
    socket.on('disconnect', this.onDisconnect.bind(this));
    socket.on('channel add', this.onAddChannel.bind(this));
    socket.on('channel edit', this.onEditChannel.bind(this));
    socket.on('thread add', this.onAddThread.bind(this));
    socket.on('thread edit', this.onEditThread.bind(this));
    socket.on('user add', this.onAddUser.bind(this));
    socket.on('user edit', this.onEditUser.bind(this));
    socket.on('user remove', this.onRemoveUser.bind(this));
    socket.on('message add', this.onMessageAdd.bind(this));
    socket.on('auth-good', this.onLogin.bind(this));
    socket.on('warning', this.onAlert.bind(this));
  }
  componentDidUpdate() {
    // THIS SHIT ISFUCKEDI NEEDA DEEPER UNDERSTANDING OF REACT.
    //console.log("THE CHANENLS I NQUESIONT ARE ", this.state.channels)
    //let {activeChannel, channels} = this.state;
    //this.setState({activeChannel: channels[0]});
    //this.setChannel(channels[0].id)
    //console.log("current channel is,", this.state.activeChannel)
  }
  onMessageAdd(message){
    let {messages} = this.state;
    messages.push(message);
    this.setState({messages});
  }
  onRemoveUser(removeUser){
    let {users, activeSessions} = this.state;
    users = users.filter(user => {
      return user.id !== removeUser.id;
    });

    /** TODO REFACTOR **/
    activeSessions = []
    users.forEach(function (user) {
      if (user.id !== '') { activeSessions.push(user.id) }
      if (user.accountId !== '') { activeSessions.push(user.accountId) }
    });


    this.setState({users, activeSessions});
  }
  onAddUser(user){
    let {users, activeSessions} = this.state;
    users.push(user);

    /** TODO REFACTOR **/
    activeSessions = []
    users.forEach(function (user) {
      if (user.id !== '') { activeSessions.push(user.id) }
      if (user.accountId !== '') { activeSessions.push(user.accountId) }
    });


    this.setState({users, activeSessions});
  }
  onEditUser(editUser){
    let {users, activeSessions} = this.state;
    users = users.map(user => {
      if(editUser.id === user.id){
        return editUser;
      }
      return user;
    });

    /** TODO REFACTOR **/
    activeSessions = []
    users.forEach(function (user) {
      if (user.id !== '') { activeSessions.push(user.id) }
      if (user.accountId !== '') { activeSessions.push(user.accountId) }
    });

    this.setState({users, activeSessions});
  }
  onConnect(){
    this.setState({connected: true});
    this.socket.emit('channel subscribe');
    //this.socket.emit('thread subscribe');
    this.socket.emit('user subscribe');
  }
  onDisconnect(){
    this.setState({connected: false});
  }
  onAddChannel(channel){
    let {channels, activeChannel} = this.state;
    channels.push(channel);
    
    if (Object.keys(activeChannel).length === 0) {
      if (channel.name == 'misc') {
        activeChannel = channel;
        console.log("WE SET TO MISC")
        //alert("ADDING MISC == ");
      }
   }
   this.setState({channels, activeChannel});
  }
  addChannel(name){
    this.socket.emit('channel add', {name});
  }
  onEditChannel(editChannel){
    let {channels} = this.state;
    channels = channels.map(channel => {
      if(editChannel.id === channel.id){
        return editChannel;
      }
      return channel;
    });
    this.setState({channels});
  }
  
  setChannel(activeChannel){
    this.setState({activeChannel});
    this.setState({activeThread: {}})
    this.setState({messages: []})
    this.socket.emit('thread unsubscribe');
    this.setState({threads: []});
    this.socket.emit('thread subscribe',
      {channelId: activeChannel.id});
  }

  onAddThread(thread){
    let {threads} = this.state;
    console.log("adding thread", thread);
    threads.push(thread);
    this.setState({threads});
  }
  addThread(name){
    let {activeChannel} = this.state;
    console.log("we r gonna send:");
    console.log(JSON.stringify({name, channelId: activeChannel.id}));
    this.socket.emit('thread add', {name, channelId: activeChannel.id});
  }
  onEditThread(editThread){
    // TODO: 
    // if activeThread is nil, or is not in {threads} , 
    // then display:none the messages div
    console.log("threads have been edited!");
    let {threads} = this.state;
    threads = threads.map(thread => {
      if(editThread.id === thread.id){
        return editThread;
      }
      return thread;
    });
    this.setState({threads});
  }
  setThread(activeThread){
    this.setState({activeThread});
    console.log("FORCING UPDATE")
    this.forceUpdate()
    this.socket.emit('message unsubscribe');
    this.setState({messages: []});
    this.socket.emit('message subscribe',
      {threadId: activeThread.id});
  }

  setUserName(name){
    this.socket.emit('user edit', {name});
  }
  addMessage(body, attachment){
    let {activeThread} = this.state;
    console.log("we are submitting", attachment);
    this.socket.emit('message add',
      {threadId: activeThread.id, Body: body, Attachment: attachment});
  }
  render(){
    var msg_panel, thread_panel;
    var right_side_container_class_name = "";
    let {activeThread} = this.state;
    if (!isEmpty(activeThread)){
      right_side_container_class_name = "rght"
      msg_panel = <MessageSection 
            {...this.state} 
            addMessage={this.addMessage.bind(this)} 
            setChannel={this.setChannel.bind(this)} 
            onAlert={this.onAlert.bind(this)}
            />
    }
    else {
      right_side_container_class_name = "rght-nomsgs";
      thread_panel = <ThreadSection
            {...this.state}
            addThread={this.addThread.bind(this)}
            setThread={this.setThread.bind(this)}
          />
    }
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div className='app'>
        <div className='toolbar'>
          <NavSection
                {...this.state}
                OpenAuthModal={this.OpenAuthModal.bind(this)}
                setChannel={this.setChannel.bind(this)}
                LogoutUser={this.LogoutUser.bind(this)}
              />
        </div>
        <div className='cont'>
            <div className='nav'>
              <UserSection
                {...this.state}
                setUserName={this.setUserName.bind(this)}
              />
            </div>
            <div className={right_side_container_class_name}>
              {thread_panel}
              {msg_panel}
            </div>
        </div>
        <AlertBar
          ref="snackbar"
          {...this.state}
          />
          <div>
            <AuthModal 
              ref="authModal"
              {...this.state}
              LoginUser={this.LoginUser.bind(this)}
              RegisterUser={this.RegisterUser.bind(this)}
            />
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App

/* 

<div className='nav'>
  <UserSection
    {...this.state}
    setUserName={this.setUserName.bind(this)}
  />
</div>

*/
