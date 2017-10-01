/**
 * 后台主界面组件 新手请注意，前方高能，请保重
 * @author yangyunlong
 */
import React, {Component} from 'react';
import '../static/api';
import menus from './menus';
import './index.css';
//界面头部组件
class Header extends Component {
    constructor(props) {super(props);}
    render() {
        return (
            <div id='main-header'>
                <div id="main-hleft">速洗达商家管理系统</div>
                <div id="main-hright">
                    <span id="main-feedback">意见反馈</span>
                    <span id="main-password">修改密码</span>
                    <input type="button" value="退出" id="main-logout"/>
                </div>
            </div>
        );
    }
}
//界面主体容器组件
class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {name:null,status:null,logo:null,orders:null};
    }
    //获取店铺状态数据
    componentDidMount() {
        axios.post(api.U('index'),api.data({token:this.props.token}))
        .then((response)=>{
            let result = response.data.data;
            this.setState({
                name:result.mname,    //店铺名称
                status:result.state,    //店铺状态
                logo:'url(' +api.host+result.circle_logo+ ')',    //店铺头像
                orders:result.will_dispose    //店铺待处理订单数
            });         
        });
    }

    render() {
        let state = this.state,
            mainStyle = {
                height:'100%',width:'100%',
                display:'flex',display:'-webkit-flex',
                justifyContent:'space-between'
            };
        return (
            <div style={mainStyle}>
                <Sidebar 
                    token={this.props.token} 
                    menus={menus} 
                    name={state.name} 
                    status={state.status} 
                    logo={state.logo} 
                    orders={state.orders}
                />
                <Container>{this.props.children}</Container>
            </div>
        );
    }
}
//侧边栏容器组件
class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {option:null,menu:null};
        this.monitorOption = this.monitorOption.bind(this);
        this.monitorMenu = this.monitorMenu.bind(this);
    }
    monitorOption(option) {this.setState({option:option});}
    monitorMenu(menu) {
        if (this.state.menu == menu) menu = null;
        this.setState({menu:menu});
    }
    render() {
        let props = this.props,
            state = this.state,
            menus = props.menus.map((obj) => 
            //创建多个菜单组件
            <Menu 
                key={obj.id} 
                id={obj.id} 
                orders={props.orders}
                selection={obj.selection} 
                options={obj.options} 
                menu={state.menu}
                option={state.option}
                parentMonitorMenu={this.monitorMenu}
                parentMonitorOption={this.monitorOption}
            />
        );
        return (
            <aside id='main-sidebar'>
                <Base token={props.token} name={props.name} status={props.status} logo={props.logo}/>
                <div id='main-nav'>{menus}</div>
            </aside>
        );
    }
}
//侧边栏信息状态视图组件
class Base extends Component {
    constructor(props) {
        super(props);
        this.state = {status:null};
        this.statusSwitchover = this.statusSwitchover.bind(this);
    }
    statusSwitchover() {
        //操作当前店铺状态时，获取当前店铺状态并取反
        let status = this.state.status,
            pstatus = this.props.status,
            state = null == status ? (1 == pstatus ? 3 : 1) : (1 == status ? 3 : 1);
        axios.post(api.U('statusSwitchover'),api.data({token:this.props.token,state:state}))
        .then((response) => {
            if (api.verify(response.data)) this.setState({status:state});
        });
    }
    render() {
        let props = this.props,
            status = this.state.status,
            isOpen = null == status ? (1 == props.status) : (1 == status),
            bg = isOpen ? 'main-open' : 'main-close',
            word = isOpen ? '营业中' : '暂停营业';
        return (
            <div id='main-base'>
                <div id="main-logo" style={{backgroundImage:props.logo}}></div>
                <div id="main-name">{props.name}</div>
                <div id="main-state" onClick={this.statusSwitchover} className={bg}>{word}</div>
            </div>
        );
    }
}
//菜单视图组件
class Menu extends Component {
    constructor(props) {
        super(props);
        this.chooseOption = this.chooseOption.bind(this);
        this.chooseMenu = this.chooseMenu.bind(this);
    }
    chooseOption(e) {this.props.parentMonitorOption(e.target.dataset.id);}
    chooseMenu(e) {this.props.parentMonitorMenu(this.props.id);}
    render() {
        let sel = this.props.selection,
            opt = this.props.options,
            isShowOrders = 'order' == sel.id && this.props.orders > 0,
            isSpread = this.props.id == this.props.menu,
            status = isSpread ? 'main-spread' : 'main-shrink',    //判断当前大选项是否为选中状态
            optStatus = {display:isSpread ? 'block' : 'none'},
            items = opt.map((obj) => 
                //创建多个选项
                <nav 
                    key={obj.id} 
                    data-id={obj.id}
                    className={this.props.option == obj.id ? 'main-chosen' : null} 
                    onClick={this.chooseOption}
                >
                    {obj.text}
                    {isShowOrders && '订单处理' == obj.text? <em className='main-tag'>{this.props.orders}</em> : ''}
                </nav>
            );
        return (
            <dl>
                <dt onClick={this.chooseMenu} className='main-selection'>
                    <div id={sel.id}>{sel.text}</div>
                    <div className={status}></div>
                </dt>
                <dd className='main-option' style={optStatus}>{items}</dd>
            </dl>
        );
    }
}
//右侧视图展示组件
class Container extends Component {
    constructor(props) {super(props);}
    render() {
        return (<div id='main-container'>{this.props.children}</div>);
    }
}
//首页右侧展示
class Index extends Component {
    constructor(props) {super(props);}
    render() {
        return (<div></div>);
    }
}
export default Main;
export {Main,Header};
//ReactDOM.render(<Main menus={menus}/>,document.getElementById('main'));