import React, {Component} from 'react';

class User extends Component{
  render(){
    return (
      <li>
        {this.props.user.name}|
        <small>{this.props.user.id}</small>|
        <em>{this.props.user.accountId}</em>
      </li>
    )
  }
}

User.propTypes = {
  user: React.PropTypes.object.isRequired
}

export default User