/**
 * 新增个人会员组件
 * @author yangyunlong
 */
const {ipcRenderer} = window.require('electron');
import React from 'react';
import Radio from '../UI/radio/App';
import Gateway from '../UI/gateway/App';
import Pay from '../UI/pay/App';
import './App.css';

export default class extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            uname:'',
            sex:1,
            birthday:'1980-01-01',
            addr:'',
            remark:'',
            checked:0,
            cardChecked:0,
            show:false,
            status:'pay',
            cards:[],
            amount:'',
            discount:'',
        };
        this.gateway = [
            'CASH',             //现金支付
            'WechatPay_Pos',    //微信扫码支付
            'Alipay_AopF2F'    //支付宝扫码付
        ];
        this.handleSex = this.handleSex.bind(this);
        // this.handleCardChecked = this.handleCardChecked.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        laydate.render({
            elem:this.input,
            value:'1980-01-01',
            min:'1950-01-01',max:0,
            btns: ['now', 'confirm'],
            theme:'#ff6e42',
            done:(value => this.setState({birthday:value}))
        });
        // axios.post(api.U('merchant_cards'),api.D({token:this.props.token}))
        // .then(response => {
        //     api.V(response.data) && this.setState({cards:response.data.result,amount:response.data.result[0].price});
        // });
    }
    handleSex(value, checked) {!checked && this.setState({sex:value})}
    // handleCardChecked(e) {
    //     let index = e.target.dataset.index;
    //     (this.state.cardChecked != index) && this.setState({cardChecked:index,amount:this.state.cards[index].price});
    // }
    handleClick() {
        if (
            '' == this.state.uname
            ||
            isNaN(this.state.amount)
            ||
            this.state.amount < 0
        ) return;
        if (0 != this.state.checked) {
            this.setState({show:true});
        } else {
            this.submit();
        }
    }
    submit(authCode) {
        authCode = tool.isSet(authCode) ? authCode : '1';
        axios.post(
            api.U('member_add1_0_6'),
            api.D({
                token:this.props.token,
                umobile:this.props.param,
                uname:this.state.uname,
                sex:this.state.sex,
                birthday:this.state.birthday,
                reg_from:4,
                auth_code:authCode,
                // cid:this.state.cards[this.state.cardChecked].id,
                discount:this.state.discount,
                amount:this.state.amount,
                remark:this.state.remark,
                addr:this.state.addr,
                gateway:this.gateway[this.state.checked]
            })
        )
        .then(response => {
            if (api.V(response.data)) {
                ipcRenderer.send(
                    'print-silent',
                    'public/prints/recharge.html',
                    {token:this.props.token,record_id:response.data.result,url:api.U('recharge_print')}
                );
                this.props.changeView({view:'index'});
            } else {
                if (0 != this.state.checked) {
                    this.setState({status:'fail'});
                }
            }
        });
    }
    onConfirm(authCode) {
        this.setState({status:'loading'});
        this.submit(authCode);
    }
    render() {
        let props = this.props,
            state = this.state;
        let html = this.state.cards.map((obj, index) =>
            <div
                key={obj.id}
                data-index={index}
                className={'mau-option' + (this.state.cardChecked == index ? ' checked' : '')}
                onClick={this.handleCardChecked}
            >
                <div data-index={index}>{obj.card_name}</div>
                <div data-index={index}>{obj.price}<span>元</span></div>
                <div data-index={index}>{obj.discount}折</div>
            </div>
        );
        return (
            <div>
                <div className='m-container'>
                    <div style={{marginBottom:'10px',fontSize:'18px'}}>个人会员信息</div>
                    <table className='m-table' style={{marginBottom:'20px'}}>
                        <tbody className='member-update'>
                            <tr className='bd-lightgrey'>
                                <td>姓名</td>
                                <td><input type='text' value={this.state.uname} onChange={e => this.setState({uname:e.target.value})}/></td>
                            </tr>
                            <tr className='bd-lightgrey'><td>手机号</td><td>{this.props.param}</td></tr>
                            <tr className='bd-lightgrey'>
                                <td>性别</td>
                                <td>
                                    <Radio value='1' checked={1 == this.state.sex} onClick={this.handleSex}>男</Radio>
                                    &emsp;&emsp;
                                    <Radio value='2' checked={2 == this.state.sex} onClick={this.handleSex}>女</Radio>
                                </td>
                            </tr>
                            <tr className='bd-lightgrey'>
                                <td>生日</td>
                                <td><input type='text' value={this.state.birthday} ref={input => this.input = input} readOnly/></td>
                            </tr>
                            <tr className='bd-lightgrey'>
                                <td>折扣</td>
                                <td><input type='text' value={this.state.discount} onChange={e => this.setState({discount:e.target.value})}/>&nbsp;折</td>
                            </tr>
                            <tr className='bd-lightgrey'>
                                <td>充值金额</td>
                                <td><input type='text' value={this.state.amount} onChange={e => this.setState({amount:e.target.value})}/>&nbsp;元</td>
                            </tr>
                            <tr className='bd-lightgrey'>
                                <td>地址</td>
                                <td><input style={{width:'100%'}} type='text' value={this.state.addr} onChange={e => this.setState({addr:e.target.value})}/></td>
                            </tr>
                            <tr className='bd-lightgrey'>
                                <td>备注</td>
                                <td><input style={{width:'100%'}} type='text' value={this.state.remark} onChange={e => this.setState({remark:e.target.value})}/></td>
                            </tr>
                        </tbody>
                    </table>
                    {/* <div style={{fontSize:'18px',marginBottom:'20px'}}>会员类型</div> */}
                    {/* <div className='mau-box'>{html}</div> */}
                    <Gateway checked={this.state.checked} callback={value => this.setState({checked:value})}/>
                    <div style={{marginTop:'20px'}}>
                        <input type='button' className='m-btn confirm large' value='立即支付' onClick={this.handleClick}/>
                    </div>
                </div>
                <Pay
                    show={this.state.show}
                    status={this.state.status}
                    amount={this.state.amount}
                    onClose={() => this.setState({show:false,status:'pay'})}
                    onConfirm={this.onConfirm}
                />
            </div>
        );
    }
}