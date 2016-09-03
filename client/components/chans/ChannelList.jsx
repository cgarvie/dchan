import React, {Component} from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';



class ChannelList extends Component{
  constructor(props) {
    super(props);
    const {activeChannel} = this.props;
    this.state = {
      value: activeChannel,
      //value: '784b3c2e-367c-4dac-affe-432275a25dd0',
      //value: 1
    };
  }

  handleChange(event, index, value) {
    this.setState({value});
    const {setChannel} = this.props;
    setChannel(value);
  }

  render(){
    let {activeChannel} = this.props;
    return (
      <div>
        <DropDownMenu value={activeChannel} onChange={this.handleChange.bind(this)}>
          {this.props.channels.map( chan =>{
            /*
            return <Channel 
              channel={chan}
              key={chan.id}
              //value={chan.id}
              //primaryText={chan.name}
              //onClick={this.handleChange}
              {...this.props}
            />
            */
            //if (chan.name != 'misc') {}
            return <MenuItem 
                    key={chan.id}
                    value={chan}
                    primaryText={'/'+chan.name+'/'}
                    secondaryText={chan.description}
                     />
          })}
        </DropDownMenu>
      </div>
    )
  }
}

ChannelList.propTypes = {
  channels: React.PropTypes.array.isRequired,
  setChannel: React.PropTypes.func.isRequired,
  activeChannel: React.PropTypes.object.isRequired,
}

/*

      <DropDownMenu value='{activeChannel.id}' onChange={this.handleChange.bind(this)}>



        
        */

export default ChannelList