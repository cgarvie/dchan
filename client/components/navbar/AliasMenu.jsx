import React, {Component} from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';



class AliasMenu extends Component{
  constructor(props) {
    super(props);
    const {activeAlias} = this.props;
    this.state = {
      //value: activeAlias
      value: ''
    };
  }

  handleChange(event, index, value) {
    this.setState({value});
    //const {activeAlias} = this.props;
    if (value !== 'add-new-alias') {
      this.props.setActiveAlias(value)
    } else {
      this.props.OpenAliasModal()
    }
  }

  render(){
    let {activeAlias} = this.props;
    return (
      <div>
        <DropDownMenu value={activeAlias} onChange={this.handleChange.bind(this)}>
        <MenuItem 
                    key=''
                    value=''
                    primaryText='(my username)'
                    />
          {this.props.aliases.map( alias =>{
            return <MenuItem 
                    key={alias}
                    value={alias}
                    primaryText={alias}
                    />
          })}
          
            <MenuItem 
                    key='add-new-alias'
                    value='add-new-alias'
                    primaryText='[+] New Alias'
                    />
        </DropDownMenu>
      </div>
    )
  }
}

AliasMenu.propTypes = {
  aliases: React.PropTypes.array.isRequired,
  setActiveAlias: React.PropTypes.func.isRequired,
  activeAlias: React.PropTypes.string.isRequired,
}

export default AliasMenu