/**
 * 后台主界面组件
 * @author yangyunlong
 */

const {dialog} = window.require('electron').remote;
const {ipcRenderer} = window.require('electron');
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import menus from './menus';
import route from './route';
const Passwd = route.passwd;    //修改密码组件
const Feedback = route.feedback;    //用户反馈
import './api';    //注册全局api对象
import './tool';    //注册全局tool对象
import './main.css';
import './media.css';    //媒体查询相应式处理css

const order = localStorage.getItem('order'),
      isRoot = localStorage.getItem('is_root'),
      branch = 'master',    //当前项目分支
      special = false,        //是否为正章打印机
      version = '1.0.7';

//界面主体容器组件
class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token:localStorage.getItem('token'),
            name:null,
            status:null,
            logo:null,
            amount:null,
            count:null,    //数据状态
            option:null,  //菜单栏样式状态
            view:'index',    //视图索引
            param:null,    //附带参数
            bottom:0
        };
        this.changeView = this.changeView.bind(this);
        this.toggle = this.toggle.bind(this);
    }
    //获取店铺状态数据
    componentDidMount() {
        axios.post(api.U('index'),api.D({token:this.state.token}))
        .then(response => {
            let result = response.data.result;
            this.setState({
                name:result.mname,    //店铺名称
                status:(10 == result.mstatus ? 1 : 0),    //店铺状态   10营业中，11休息
                logo:result.mlogo,    //店铺头像
                amount:result.amount,    //今日营业总额
                count:result.order_count    //有效订单
            });         
        });
    }
    //营业状态切换
    toggle() {
        let status = (this.state.status ? 0 : 1);    //操作当前店铺状态时，获取当前店铺状态并取反
        axios.post(api.U('toggle'),api.D({token:this.state.token,open:status}))
        .then(response => {        	
            if (api.V(response.data)) this.setState({status:status});
        });
    }
    //右侧界面动态转换事件方法
    changeView(e) {
        if (!tool.isSet(e.target)) {
            tool.isSet(e.view) && this.setState({view:e.view,param:e.param});
            tool.isSet(e.token) && this.setState({token:e.token});
        } else {
            let data = e.target.dataset;
            tool.isSet(data.view) && this.state.view != data.view && this.setState({view:data.view});
            tool.isSet(data.option) && this.setState({option:data.option});
            tool.isSet(data.param) && this.setState({param:data.param});
        }
    }


    render() {
        let state = this.state,
            props = this.props,
            list = menus.map((obj) =>     //创建多个菜单组件
            <Menu 
                key={obj.id}
                id={obj.id}
                text={obj.text}
                options={obj.options} 
                option={state.option}
                changeView={this.changeView}
                token={this.state.token}
            />
        );
        let E = route[state.view];   //展示指定视图组件
        return (
            <div id='main'>
                <Header token={this.state.token}/>
                {/* 左侧菜单栏容器 */}
                <aside>
                    <div>
                        {/* 信息展示组件 */}
                        <Status name={state.name} status={state.status} logo={state.logo} toggle={this.toggle}/>
                        {/* 导航容器组件及导航栏视图组件 */}
                        <div id='menu'>{list}</div>
                    </div>
                </aside>
                {/* 右侧视图容器 */}
                <E
                    token={this.state.token}
                    param={state.param}
                    changeView={this.changeView}
                    branch={branch}
                    special={special}
                />
                <Notice changeView={this.changeView} token={this.state.token}/>
            </div>
        );
    }
}

//界面头部组件
class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feedbackShow:false,
            passwdShow:false,
            show:false,
            loading:false,
            detail:false,
            count:0,
            url:'',
            data:[],
            hasUpdate:false,
            download:'',
            downloadState:0,    //下载状态:0-未下载,1-下载中,2-下载中且无法读取文件总大小
            received:'0%',
        };
        this.toggleFeedbackShow = this.toggleFeedbackShow.bind(this);
        this.togglePasswdShow = this.togglePasswdShow.bind(this);
        this.query = this.query.bind(this);
        this.redirect = this.redirect.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.goBack = this.goBack.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }
    componentDidMount() {
        document.onclick = () => {this.setState({show:false})}
        this.interval = setInterval(this.query, 60000);
        this.query();
        axios.post(api.U('software_update'), api.D({token:this.props.token,version:version}))
        .then(response => {
            let data = response.data;
            if (api.V(response.data)) {
                this.setState({download:data.download,hasUpdate:1 == data.has_upd ? true : false});
            }
        })
        ipcRenderer.on('download', (e, arg) => {
            if ('completed' != arg.state) {
                if (0 == arg.total) {
                    2 != this.state.downloadState && this.setState({downloadState:2});
                } else {
                    let rate = Math.floor( (arg.received / arg.total) * 100);
                    this.setState({received:`${rate}%`,downloadState:1});
                }
            } else {
                ipcRenderer.send('cleanInterval', 'completed');
                this.setState({downloadState:0,received:'0%'});
            }
        });
    }
    toggleFeedbackShow() {this.setState({feedbackShow:!this.state.feedbackShow});}
    togglePasswdShow() {this.setState({passwdShow:!this.state.passwdShow});}
    componentWillUnmount() {clearInterval(this.interval)}
    handleClick(e) {
        if (!this.state.show) {
            this.setState({show:true,loading:true});
            axios.post(api.U('msg_list'), api.D({token:this.props.token}))
            .then(response => {
                console.log(response.data);
                api.V(response.data) && this.setState({data:response.data.result,loading:false});
            });
        } else {
            this.setState({show:false})
        }
        e.nativeEvent.stopImmediatePropagation();
    }
    query() {
        axios.post(api.U('msg_count'), api.D({token:this.props.token}))
        .then(response => {
            console.log(response.data);
            api.V(response.data) && this.setState({count:response.data.result.message_count});
        });
    }
    redirect(e) {
        this.state.data[e.target.dataset.index].state = 1;
        this.setState({data:this.state.data,detail:true,url:e.target.dataset.url,count:(this.state.count - 1)});
    }
    goBack(e) {
        this.setState({detail:false});
    }
    handleDelete(e) {
        let index = e.target.dataset.index;
        axios.post(api.U('msg_delete'), api.D({token:this.props.token,id:e.target.dataset.id}))
        .then(response => {
            if (api.V(response.data)) {
                let obj = {};
                if (0 == this.state.data[index].state && this.state.count > 0) obj.count = (this.state.count - 1);
                this.state.data.splice(index, 1);
                obj.data = this.state.data;
                this.setState(obj);
            }
        });
    }
    handleUpdate() {
        if (confirm('确认下载最新版本软件?')) {
            dialog.showOpenDialog(
                {properties: ['openDirectory']},
                (path) => {
                    if ('undefined' === typeof path) return;
                    ipcRenderer.send('download', {url:this.state.download,floder:path[0]});
                    this.setState({downloadState:2});
                }
            );
        }
    }
    render() {
        let html = null;
        if (!this.state.detail && !this.state.loading) {
            html = this.state.data.map( (obj, index) => 
                <div className='main-msg' key={obj.id}>
                    {0 == obj.state && (<i className='main-msg-read'></i>)}
                    <div>
                        <div data-index={index} data-url={obj.url} onClick={this.redirect}>{obj.title}</div>
                        <span>{tool.currentDate('datetime', obj.time)}</span>
                    </div>
                    <div>{obj.content}</div>
                    <div><i className='fa fa-trash-o' data-id={obj.id} data-index={index} onClick={this.handleDelete}></i></div>
                </div>
            );
        }
        return (
            <header>
                <div>速洗达商家管理系统</div>
                <div>      
                    <span onClick={this.toggleFeedbackShow}>
                        <i className="fa fa-pencil-square"></i>&nbsp;意见反馈
                    </span>
                    <span onClick={this.togglePasswdShow}>
                        <i className="fa fa-lock"></i>&nbsp;修改密码
                    </span>
                    {this.state.hasUpdate && 0 == this.state.downloadState && (<span onClick={this.handleUpdate}><i className="fa fa-download"></i>&nbsp;版本更新</span>)}
                    {1 == this.state.downloadState && (
                        <span>
                            <span className='main-download-bg'>
                                <span className='main-download-bd'>{this.state.received}</span>
                                <span className='main-download-progressing' style={{height:this.state.received}}></span>
                            </span>&nbsp;下载中
                        </span>
                    )}
                    {2 == this.state.downloadState && (<span><i className='fa fa-circle-o-notch fa-spin'></i>&nbsp;下载中</span>)}
                    <span className='main-bell-box'>
                        <div
                            className={'main-bell' + (this.state.count > 0 ? ' has-msg' : '')}
                            onClick={this.handleClick}
                            ref={dom => this.dom = dom}
                        >{this.state.count > 0 ? this.state.count : (<i className='fa fa-bell'></i>)}</div> 
                        <div
                            className='main-message'
                            style={{display:(this.state.show ? 'block' : 'none')}}
                            onClick={e => e.nativeEvent.stopImmediatePropagation()}
                        >
                            <div className='triangle-bd'></div>
                            <div className='triangle'></div>
                            <div className='main-msg-head'>
                                {this.state.detail && (<i className='fa fa-arrow-left' onClick={this.goBack}></i>)}
                                <div>{this.state.detail ? '消息详情' : '消息列表'}</div>
                            </div>
                            <div className='main-msg-loading' style={{display:(this.state.loading ? 'block' : 'none')}}>
                                <i className='fa fa-circle-o-notch fa-spin'></i>
                            </div>
                            <div
                                className='main-msg-body'
                                style={{display:( (this.state.loading || this.state.detail) ? 'none' : 'block' )}}
                            >
                                <div className='no-msg' style={{display:(this.state.data.length > 0 ? 'none' : 'block')}}>已看完所有通知!</div>
                                {html}
                            </div>
                            <div className='main-msg-detail' style={{display:(this.state.detail ? 'block' : 'none')}}>
                                <iframe src={this.state.url}></iframe>
                            </div>
                        </div>
                    </span>
                </div>
                <Passwd
                    show={this.state.passwdShow} 
                    onCancelRequest={this.togglePasswdShow} 
                    token={this.props.token}
                />
                <Feedback
                    show={this.state.feedbackShow} 
                    onCancelRequest={this.toggleFeedbackShow} 
                    token={this.props.token}
                />
            </header>
        );
    }
}

//侧边栏信息状态视图组件
class Status extends Component {
    constructor(props) {super(props)}
    render() {
        let props = this.props,
            word = ( props.status ? '营业中' : '休息中' ),
            style = ( "toggle " + (props.status ? 'toggle-on' : 'toggle-off') ),
            handle = ( 1 == isRoot ? props.toggle : null );
        return (
            <div id='status'>
                <div><img src={props.logo}/></div>
                <div>{props.name}</div>
                <div onClick={handle}>
                    {1 == isRoot ? <i className={style}>{word}</i> : <i className="toggle">{word}</i>}
                </div>
            </div>
        );
    }
}
//侧边栏菜单视图组件
class Menu extends Component {
    constructor(props) {
        super(props);
        this.state = {isUp:true, auth:[]}
    }
    componentDidMount() {
        axios.post(api.U('msg_count'),api.D({token:this.props.token}))
        .then(response => {
            if (api.V(response.data)) {
                let auth = response.data.result.might,
                    len = auth.length;
                for (let i =0;i < len;++i) {
                    1 == auth[i].state && this.state.auth.push(auth[i].module);
                }
                this.setState({auth:this.state.auth});
            }
        });
    }

    render() {
        if (
            (0 == isRoot && 0 == order && 'order' == this.props.id)    //判断员工是否有线上处理权限
            ||
            (0 == isRoot && 'manage' == this.props.id)                 //员工登录时没有商家管理权限
        ) return null;

        let props = this.props,
            isUp = this.state.isUp,
            isShowOrders = 'order' == props.id && props.orders > 0,
            //tag = ('order' == props.id ? <i className='tag'>0</i> : null),
            tag = null,
            status = isUp ? 'main-shrink' : 'main-spread',    //判断当前大选项是否为选中状态
            options = props.options.map((obj, index) => 
                <dd
                    key={index}
                    style={{
                        display:( 
                            ( ( 1 != isRoot && 'finance' == props.id && -1 === obj.auth.inArray(this.state.auth) ) || isUp )
                            ?
                            'none'
                            :
                            'block'
                        )
                    }}
                    data-option={obj.key}
                    data-view={obj.key}
                    className={props.option == obj.key ? 'option-choose' : null}
                    onClick={props.changeView}
                >
                    {obj.text}&emsp;&emsp;{tag}
                </dd>
            );
        return (
            <dl>
                <dt onClick={() => this.setState({isUp:!this.state.isUp})}>
                    <i id={props.id}>{props.text}</i>
                    <i className={isUp ? 'menu-up' : 'menu-down'}></i>
                </dt>
                {options}
            </dl>
        );
    }
}


//右下角弹出层
class Notice extends Component {
    constructor(props) {
        super(props);
        this.state = {bottom:-194, time:''};
        this.hidden = this.hidden.bind(this);
        this.clearTimeID = this.clearTimeID.bind(this);
        this.connect = this.connect.bind(this);
        this.interval = null;
        this.timeout = null;
        this.toggleTime = 3;
    }
    componentDidMount() {
        this.connect();
        ipcRenderer.on('notice', (e, arg) => {
            console.log(arg);
            if ('SUCCESS' === arg.state) {
                if (null !== this.interval) return;
                this.audio.play();
                this.interval = setInterval(() => {
                    if (0 === this.state.bottom) {
                        this.clearTimeID();
                        this.timeout = setTimeout(() => this.hidden(), 5000);
                    } else {
                        this.setState({bottom:(this.state.bottom + 1), time:arg.response.data});
                    }
                }, this.toggleTime);
            } else {    //连接超时或失败后重新连接
                this.connect();
            }
        });
    }
    connect() {
        ipcRenderer.send('notice', api.U('connect'), tool.toUrlString({token:this.props.token}))
    }

    hidden() {
        this.clearTimeID();
        this.interval = setInterval(() => {
            if (-194 === this.state.bottom) {
                this.clearTimeID();
                this.connect();    //推送成功后弹窗隐藏后再次发起连接
            } else {
                this.setState({bottom:(this.state.bottom - 1)});
            }
        }, this.toggleTime);
    }
    clearTimeID() {
        if (null !== this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (null !== this.interval) {
            clearTimeout(this.interval);
            this.interval = null;
        }
    }
    render() {
        return (
            <div id='main-notice' style={{bottom:this.state.bottom + 'px'}}>
                <div>新订单提醒<i className='fa fa-times' onClick={this.hidden}></i></div>
                <div>
                    <div>您有新的订单，请及时处理</div>
                    <div>{this.state.time}</div>
                </div>
                <div><span onClick={() => this.props.changeView({view:'online'})}>查看</span></div>
                <audio style={{display:'none'}} src="media/new_order.mp3" ref={audio => this.audio = audio}></audio>
                
            </div>
        );
    }
}
ReactDOM.render(<Main/>,document.getElementById('root'));