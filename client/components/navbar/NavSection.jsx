import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import ChannelList from '../chans/ChannelList.jsx';
import AliasMenu from './AliasMenu.jsx';

class NavSection extends Component{

  constructor(props) {
    super(props);
   
  }


  logout(){
  this.props.LogoutUser();
  }



  render(){
    var chunk
    console.log("comparing to:", this.props.userSessionKey)
    if (this.props.userSessionKey) {
      chunk = <ToolbarGroup>
                <AliasMenu 
                        {...this.props}
                        {...this.state}
                    />
                <ToolbarSeparator />
                <RaisedButton label='Logout' onClick={this.logout.bind(this)} />
              </ToolbarGroup>
    }
    else {
      chunk = <ToolbarGroup>
                <RaisedButton label='Login or Register' onClick={this.props.OpenAuthModal.bind(this)} />
              </ToolbarGroup>
                    
    }
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <ChannelList 
              {...this.props}
              {...this.state}
          />
        </ToolbarGroup>
        {chunk}
      </Toolbar>
    )
  }
}

NavSection.propTypes = {
  channels: React.PropTypes.array.isRequired,
  activeChannel: React.PropTypes.object.isRequired,
  OpenAuthModal: React.PropTypes.func.isRequired,
  OpenAliasModal: React.PropTypes.func.isRequired,
  LogoutUser: React.PropTypes.func.isRequired,
  setChannel: React.PropTypes.func.isRequired,
  userSessionKey: React.PropTypes.string.isRequired,
  setActiveAlias: React.PropTypes.func.isRequired,
}

export default NavSection