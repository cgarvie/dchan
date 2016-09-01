import React from 'react';
import UserForm from './UserForm.jsx';
import UserList from './UserList.jsx';

class UserSection extends React.Component{
  render(){
    return (
      <div className='support panel panel-primary'>
        <div className='panel-heading'>
        <strong>{ this.props.users.length } users are online now.</strong>
        </div>
        <div className='panel-body users'>
          <UserList {...this.props} />
        </div>
      </div>
    )
    // <strong>This channel has had XX users active in the past 30 days, of whom YY users are online now.</strong>
    // <UserForm {...this.props} />
  }
}

UserSection.propTypes = {
  users: React.PropTypes.array.isRequired,
  setUserName: React.PropTypes.func.isRequired
}

export default UserSection