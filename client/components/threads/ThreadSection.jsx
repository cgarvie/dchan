import React, {Component} from 'react';
import ThreadForm from './ThreadForm.jsx';
import ThreadList from './ThreadList.jsx';

class ThreadSection extends Component{
  render(){
    let {activeChannel} = this.props;
    // {activeChannel.name || 'Select a chan'}
    // {activeChannel.name ? 'Threads' : 'Select a Channel'}
    return (
      <div className='threads-container panel panel-default'>
        <div className='panel-heading'>
          <strong>{activeChannel.description || 'Select a Channel'}</strong>
        </div>
        <div className='panel-body threads'>
          <ThreadList {...this.props} />
          <ThreadForm {...this.props} />
        </div>
      </div>
      
    )
  }
}

ThreadSection.propTypes = {
  threads: React.PropTypes.array.isRequired,
  setThread: React.PropTypes.func.isRequired,
  addThread: React.PropTypes.func.isRequired,
  activeChannel: React.PropTypes.object.isRequired
}

export default ThreadSection