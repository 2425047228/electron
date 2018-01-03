/**
 * 新增企业会员组件
 * @author yangyunlong
 */
const {ipcRenderer} = window.require('electron');
import React, {Component} from 'react';
import '../api';
import Crumbs, {Search, PayMent} from '../static/UI';

export default class MemberRecharge extends Component{
    constructor(props) {
        super(props);
        this.params = this.props.param;
        this.state = {
            memberInfo:{
                member:{},
                merchantCardsRule:[{},{},{}]
            },
            payment:0,amount:'',give:'',
            paymentStatus:'payment',isShow:false
        };
        this.onPayRequest = this.onPayRequest.bind(this);
        this.onOnlinePayRequest = this.onOnlinePayRequest.bind(this);
        this.printOrder = this.printOrder.bind(this);
    }

    componentDidMount() {
        axios.post(api.U('getMerchantMember'),api.data({token:this.props.token,member_id:this.params.id}))
        .then(response => {
            this.setState({memberInfo:response.data.data});
            console.log(response.data);
        });
    }

    onPayRequest() {
        let state = this.state,
            member = state.memberInfo.member;
        if (!isNaN(state.amount) && state.amount > 0) {
            if (0 !== state.payment) {
                this.setState({isShow:true});
            } else {
                this.setState({paymentStatus:'loading'})
                axios.post(
                    api.U('rechargeMerchantCard'),
                    api.D({
                        token:this.props.token,
                        uid:member.id,
                        card_name:member.card_name,
                        balance:state.amount,
                        auth_code:'',
                        give:state.give,
                        type:1,pay_type:'CASH'
                    })
                )
                .then(response => {
                    if (api.verify(response.data)) {
                        console.log(response.data);
                        this.printOrder(response.data.data.rechargeId);
                        this.setState({paymentStatus:'success'});
                        this.props.changeView({element:'index'});
                    } else {
                        this.setState({paymentStatus:'fail'});
                    }
                });
            }
        }
        
    }
    onOnlinePayRequest(authcode, amount) {
        let state = this.state,
            member = state.memberInfo.member;
        this.setState({paymentStatus:'loading'})
        axios.post(
            api.U('rechargeMerchantCard'),
            api.D({
                token:this.props.token,
                uid:member.id,
                card_name:member.card_name,
                balance:amount,
                auth_code:authcode,
                give:state.give,
                type:1,pay_type:(1 == state.payment ? 'WECHAT' : 'ALI')
            })
        )
        .then(response => {
            console.log(response.data);
            if (api.verify(response.data)) {
                this.printOrder(response.data.data.rechargeId);
                this.setState({paymentStatus:'success'});
                this.props.changeView({element:'index'});
            } else {
                this.setState({paymentStatus:'fail'});
            }
        });
    }

    printOrder(rechargeId) {
        let props = this.props;
        ipcRenderer.send(
            'print-silent',
            'public/prints/recharge.html',
            {uid:props.uid,token:props.token,recharge_id:rechargeId}
        );
    }

    render() {
        let props = this.props,
            state = this.state,
            member = state.memberInfo.member,
            rule = state.memberInfo.merchantCardsRule;
        return (
            <div>
                <Crumbs 
                    crumbs={[{key:0,text:'会员管理',e:'member_manage'},{key:1,text:'会员充值'}]} 
                    callback={props.changeView}
                />
                <section className='ui-container'>
                    <div style={{marginBottom:'10px',fontSize:'18px'}}>核对会员信息</div>
                    <div className='ui-mcd-row'>
                        <div style={{width:'50%'}}>卡号：{member.ucode}</div>
                        <div style={{width:'25%'}}>姓名：{member.username}</div>
                        <div style={{width:'25%'}}>手机号：{member.mobile_number}</div>
                    </div>
                    <div className='ui-mcd-row'>
                        <div style={{width:'50%'}}>会员类型：{member.card_name}</div>
                        <div style={{width:'50%'}}>当前余额：<span className='ui-red'>{member.balance}</span></div>
                    </div>
                    <div style={{margin:'20px 0 10px',fontSize:'18px'}}>核对会员信息</div>
                    <div className='ui-recharge-notice-box'>
                        <div style={{paddingBottom:'25px',fontSize:'16px',lineHeight:'35px'}}>
                            充值金额:
                            <input 
                                type='text' 
                                className='ui-mcd-input' 
                                value={state.amount}
                                onChange={e => this.setState({amount:e.target.value})}
                            />&emsp;元
                            &emsp;&emsp;&emsp;
                            赠送会员：
                            <input 
                                type='text' 
                                className='ui-mcd-input' 
                                value={state.give}
                                onChange={e => this.setState({give:e.target.value})}
                            />&emsp;元
                        </div>
                        <div style={{fontSize:'14px',lineHeight:'30px'}}>
                            <p>温馨提示</p>
                            <p>
                                充值金额
                                <span className='ui-red'>&ge;{rule[1].price}且&lt;{rule[2].price}元</span>,
                                可升级为{rule[1].card_name},享受
                                <span className='ui-red'>{rule[1].discount}</span>
                                折优惠
                            </p>
                            <p>
                                充值金额
                                <span className='ui-red'>&ge;{rule[2].price}元</span>,
                                可升级为{rule[2].card_name},享受
                                <span className='ui-red'>{rule[2].discount}</span>
                                折优惠
                            </p>
                            <p>如果已经是{rule[2].card_name},无论充值多少,仍享受当前优惠</p>
                        </div>
                    </div>
                    <div className='ui-recharge-box'>
                        <section 
                            className={'ui-checkbox2' + (0 == state.payment ? ' ui-checked2' : '')} 
                            onClick={() => this.setState({payment:0})}
                        ><em className='ui-pay-icon-cash'></em><span className='ui-pay-payment'>现金支付</span></section>
                        <section 
                            className={'ui-checkbox2' + (1 == state.payment ? ' ui-checked2' : '')} 
                            onClick={() => this.setState({payment:1})}
                        ><em className='ui-pay-icon-wechat'></em><span className='ui-pay-payment'>微信支付</span></section>
                        <section 
                            className={'ui-checkbox2' + (2 == state.payment ? ' ui-checked2' : '')} 
                            onClick={() => this.setState({payment:2})}
                        ><em className='ui-pay-icon-alipay'></em><span className='ui-pay-payment'>支付宝支付</span></section>
                    </div>
                    <div style={{marginTop:'32px'}}>
                        <input 
                            type='button' 
                            className='ui-btn ui-btn-confirm ui-btn-large' 
                            value='立即支付'
                            onClick={this.onPayRequest}
                        />
                    </div>
                </section>
                <PayMent 
                    isShow={state.isShow}
                    status={state.paymentStatus}
                    amount={state.amount}
                    free='免洗订单将不会支付任何金额，此订单确定免洗吗？'
                    onCancelRequest={() => this.setState({isShow:false,paymentStatus:'payment'})}
                    onConfirmRequest={this.onOnlinePayRequest}
                />
            </div>
        );
    }
}