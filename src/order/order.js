/**
 * 订单处理组件
 * @author yangyunlong
 */
import React, {Component} from 'react';
import '../static/api';
import Crumbs, {Tabs,Search} from '../static/UI';
class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {choose:0,data:null};
        this.handleClick = this.handleClick.bind(this);
        this.willDispose = this.willDispose.bind(this);
        this.willTake = this.willTake.bind(this);
        this.willClean = this.willClean.bind(this);
        this.cleaning = this.cleaning.bind(this);
        this.willDelivery = this.willDelivery.bind(this);
        this.generateItemsList = this.generateItemsList.bind(this);
        //选项卡参数
        this.tabs = [
            {key:0,text:'待处理'},
            {key:1,text:'待收件'},
            {key:2,text:'待清洗'},
            {key:3,text:'清洗中'},
            {key:4,text:'待送达'}
        ];
        //表格头部模型
        this.theadsModel = [
            <tr className='ui-tr-h'>
                <td>订单号</td>
                <td>预约上门时间</td>
                <td>姓名</td>
                <td>电话</td>
                <td>地址</td>
                <td>时间</td>
                <td>处理</td>
            </tr>,
            <tr className='ui-tr-h'>
                <td>订单号</td>
                <td>项目</td>
                <td>工艺加价</td>
                <td>件数</td>
                <td>总价</td>
                <td>姓名／电话</td>
                <td>地址</td>
                <td>时间</td>
                <td>操作</td>
            </tr>
        ];
        //表格头部内容
        this.theads = [
            this.theadsModel[0],
            this.theadsModel[0],
            this.theadsModel[1],
            this.theadsModel[1],
            this.theadsModel[1]
        ];
        //订单进程列表对应状态
        this.process = [this.willDispose,this.willTake,this.willClean,this.cleaning,this.willDelivery];
    }
    componentDidMount() {
        axios.post(api.U('orderHandle'),api.data({token:this.props.token,state:0}))
        .then((response) => {
            let result = response.data,
                data = this.process[0](result.data);
            this.setState({data:data});
            console.log(result);
        });
    }
    handleClick(e) {
        let state = e.target.dataset.key;
        axios.post(api.U('orderHandle'),api.data({token:this.props.token,state:state}))
        .then((response) => {
            let result = response.data,
                data = this.process[state](result.data);
            this.setState({choose:state,data:data});
            console.log(result);
        });
    }
    handleSearch(e) {
        console.log(e.target.dataset.word);
    }
    //待处理
    willDispose(data) {
        let items = data.map((obj) => 
            <tr key={obj.id} className='ui-tr-d'>
                <td>{obj.ordersn}</td>
                <td className='ui-red'>{obj.time}</td>
                <td>{obj.name}</td>
                <td>{obj.phone}</td>
                <td>{obj.adr}</td>
                <td>{obj.create_time}</td>
                <td>
                    <div className='ui-box-between'>
                        <input data-id={obj.id} type='button' defaultValue='取消订单' className='ui-btn ui-btn-cancel'/>
                        <input data-id={obj.id} type='button' defaultValue='确认订单' className='ui-btn ui-btn-confirm'/>
                    </div> 
                </td>
            </tr>
        );
        return items;
    }
    //待收件
    willTake(data) {
        let items = data.map((obj) => 
            <tr key={obj.id} className='ui-tr-d'>
                <td>{obj.ordersn}</td>
                <td className='ui-red'>{obj.time}</td>
                <td>{obj.name}</td>
                <td>{obj.phone}</td>
                <td>{obj.adr}</td>
                <td>{obj.create_time}</td>
                <td>
                    <div className='ui-box-between'>
                        <input data-id={obj.id} type='button' defaultValue='取消订单' className='ui-btn ui-btn-cancel'/>
                        <input data-id={obj.id} type='button' defaultValue='添加项目' className='ui-btn ui-btn-confirm'/>
                    </div> 
                </td>
            </tr>
        );
        return items;
    }
    //待清洗
    willClean(data) {
        let items = data.map((obj) => 
            <tr key={obj.id} className='ui-tr-d'>
                <td>{obj.ordersn}</td>
                <td>{this.generateItemsList(obj.item)}</td>
                <td>
                    <div className='ui-box-between'><span>上门服务费</span><span>&yen;{obj.freight}</span></div>
                    <div className='ui-box-between'><span>特殊工艺加价</span><span>&yen;{obj.special}</span></div>
                    <div className='ui-box-between'><span>保值洗</span><span>&yen;{obj.hedging}</span></div>
                    <div className='ui-box-between'><span>优惠金额</span><span>&yen;{obj.coupon_price}</span></div>
                </td>
                <td>{obj.sum}件</td>
                <td>{obj.amount}</td>
                <td>{obj.name}<br/>{obj.phone}</td>
                <td>{obj.adr}</td>
                <td>{obj.update_time}</td>
                <td>
                    <div className='ui-box-between'>
                        <input data-id={obj.id} defaultValue='衣物检查' className='ui-btn ui-btn-confirm'/>
                        <input 
                            data-id={obj.id} 
                            defaultValue='检查完成' 
                            className={'ui-btn ' + (1==obj.pay_state ? 'ui-btn-confirm' : 'ui-btn-cancel')}
                        />
                    </div>
                </td>
            </tr>
        );
        return items;
    }
    //清洗中
    cleaning(data) {
        let items = data.map((obj) => 
            <tr key={obj.id} className='ui-tr-d'>
                <td>{obj.ordersn}</td>
                <td>{this.generateItemsList(obj.item)}</td>
                <td>
                    <div className='ui-box-between'><span>上门服务费</span><span>&yen;{obj.freight}</span></div>
                    <div className='ui-box-between'><span>特殊工艺加价</span><span>&yen;{obj.special}</span></div>
                    <div className='ui-box-between'><span>保值洗</span><span>&yen;{obj.hedging}</span></div>
                    <div className='ui-box-between'><span>优惠金额</span><span>&yen;{obj.coupon_price}</span></div>
                </td>
                <td>{obj.sum}件</td>
                <td>{obj.amount}</td>
                <td>{obj.name}<br/>{obj.phone}</td>
                <td>{obj.adr}</td>
                <td>{obj.update_time}</td>
                <td><input data-id={obj.id} defaultValue='清洗完成' className='ui-btn ui-btn-confirm'/></td>
            </tr>
        );
        return items;
    }
    //待送达
    willDelivery(data) {
        let items = data.map((obj) => 
            <tr key={obj.id} className='ui-tr-d'>
                <td>{obj.ordersn}</td>
                <td>{this.generateItemsList(obj.item)}</td>
                <td>
                    <div className='ui-box-between'><span>上门服务费</span><span>&yen;{obj.freight}</span></div>
                    <div className='ui-box-between'><span>特殊工艺加价</span><span>&yen;{obj.special}</span></div>
                    <div className='ui-box-between'><span>保值洗</span><span>&yen;{obj.hedging}</span></div>
                    <div className='ui-box-between'><span>优惠金额</span><span>&yen;{obj.coupon_price}</span></div>
                </td>
                <td>{obj.sum}件</td>
                <td>{obj.amount}</td>
                <td>{obj.name}<br/>{obj.phone}</td>
                <td>{obj.adr}</td>
                <td>{obj.update_time}</td>
                <td><input data-id={obj.id} defaultValue='送件完成' className='ui-btn ui-btn-confirm'/></td>
            </tr>
        );
        return items;
    }

    generateItemsList(items) {
        return items.map((obj) => 
            <div key={obj.id} className='ui-box-between'>
                <span>{obj.g_name}</span>
                <span>{obj.number}</span>
                <span>&yen;{obj.price}</span>
            </div>
        );
    }

    render() {
        let state = this.state;
        return (
            <div>
                <Crumbs crumbs={[{text:'订单处理',key:1}]} callbackParent={this.props.changeView}/>
                <section className='ui-container'>
                    <div className='ui-box-between'>
                        <Tabs tabs={this.tabs} choose={state.choose} callbackParent={this.handleClick}/>
                        <Search placeholder='请输入订单号' callbackParent={this.handleSearch}/>
                    </div>
                    <div className='ui-content'>
                        <table className='ui-table ui-table-b'>
                            <thead>{this.theads[state.choose]}</thead>
                            <tbody>{state.data}</tbody>
                        </table>
                    </div>
                </section>
            </div>
        );
    }
}

export default Order;