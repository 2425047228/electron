/**
 * 洗后预估设置
 * @author yangyunlong
 */
import React, {Component} from 'react';
import '../api';
import Crumbs,{QCmenu,QCtextarea} from '../static/UI';
import {afterConfig} from '../static/config';


export default class After extends Component {
    constructor(props) {
        super(props);
        this.params = this.props.param.paramToObject();    //参数列表
        this.orderId = this.params.orderId;    //订单ID
        this.id = this.params.id;    //项目ID
        this.assess = this.params.assess;    //项目内容
        this.redirectParam = 'id='+this.orderId+'&from='+this.params.from;
        this.state = {chosenArr:'' == this.assess ? [] : this.assess.split(','),text:this.params.assess_text};
        this.crumbs = [
            {text:'订单处理',key:0,e:'order'},
            {text:'衣物检查',key:1,e:'check',param:this.redirectParam},
            {text:'洗后预估',key:2}
        ];
        if ('undefined' !== typeof this.params.from && 'offline' == this.params.from) {
            this.crumbs = [
                {text:'收衣',key:0,e:'take'},
                {text:'添加项目',key:1,e:'item',param:this.redirectParam},
                {text:'工艺加价',key:2,e:'offline_craft',param:this.redirectParam},
                {text:'衣物检查',key:3,e:'check',param:this.redirectParam},
                {text:'洗后预估',key:4}
            ];
        }
        this.toggleOption = this.toggleOption.bind(this);    //选项选中取消操作
        this.cancelChecked = this.cancelChecked.bind(this);    //取消选中操作
        this.confirm = this.confirm.bind(this);
    }

    toggleOption(isChoose,value) {
        if (isChoose) {
            this.state.chosenArr.push(value);
        } else {
            let index = value.inArray(this.state.chosenArr);
            this.state.chosenArr.splice(index,1);
        }
        this.setState({chosenArr:this.state.chosenArr});
    }

    cancelChecked(e) {
        let value = e.target.parentNode.innerText,
            index = value.inArray(this.state.chosenArr);
        this.state.chosenArr.splice(index,1);
        this.setState({chosenArr:this.state.chosenArr});
    }

    confirm(value) {
        let state = this.state,
            props = this.props;
        if (state.length < 0) return;
        let assess = state.chosenArr.toString();
        axios.post(api.U('assessSubmit'),api.data({token:props.token,id:this.id,assess:assess,assess_text:value}))
        .then((response) => {
            console.log(response.data);
            if (api.verify(response.data)) {
                props.changeView({element:'check',param:this.redirectParam});
            }
        });
    }

    render() {
        let props = this.props,
        state = this.state,
        html = afterConfig.options.map((obj,index) =>
            <QCmenu 
                key={index} 
                header={afterConfig.headers[index]} 
                options={obj}
                chosenArr={state.chosenArr}
                callback={this.toggleOption}
            />
        );
    let chosenHtml = state.chosenArr.map(obj =>
            <div className='ui-chosen-item' key={obj}>
                {obj}<em className='ui-chosen-item-cancel' onClick={this.cancelChecked}></em>
            </div>
        );

    return (
        <div>
            <Crumbs crumbs={this.crumbs} callback={props.changeView}/>
            <div className='ui-container'>
                <QCtextarea 
                    callback={this.confirm} 
                    value={state.text}
                    title='您可输入洗后预估状况或选择洗后预估述'
                    placeholder='请输入洗后预估情况'
                />
                <div className='ui-box' style={{paddingTop:'20px'}}>
                    <div className='ui-question-choose-word'>已选择:</div>
                    <div className='ui-question-choose-bar'>{chosenHtml}</div>
                </div>
                <div className='ui-box-column' style={{paddingTop:'21px'}}>{html}</div>
            </div>
        </div>
    );
    }
}