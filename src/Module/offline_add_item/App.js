/**
 * 线上订单添加项目组件
 * @author yangyunlong
 */
const {ipcRenderer} = window.require('electron');
import React from 'react';
import Crumb from '../UI/crumb/App';
import Clothes from '../UI/clothes/App';
import Problem from '../UI/problem/App';
import Item from '../UI/item/App';
import ItemInfo from '../UI/item_info/App';
import ItemCost from '../UI/item_cost/App';
import UploadToast from '../UI/upload-toast/App';
import Loading from '../UI/loading/App';
import TakeTime from '../UI/take-time/App';
import './App.css';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            category:[],
            item:[],
            index:0,
            clothesShow:false,
            uploadShow:false,
            clothes:[],
            type:null,
            data:[],
            images:[],
            amount:0,
            handleIndex:null,
            trace:null,
            loadingShow:false,
            takeTimeShow:false
        };
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleClothesClick = this.handleClothesClick.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleSnChange = this.handleSnChange.bind(this);
        this.handleProblemSubmit = this.handleProblemSubmit.bind(this);
        this.handleCraftDes = this.handleCraftDes.bind(this);
        this.handleCraftPrice = this.handleCraftPrice.bind(this);
        this.handleKeepPrice = this.handleKeepPrice.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleImageDelete = this.handleImageDelete.bind(this);
        this.handleImageChoose = this.handleImageChoose.bind(this);
        this.handleTakeTime = this.handleTakeTime.bind(this);
        console.log(this.props.param);
    }
    componentDidMount() {
        axios.post(api.U('offline_add_item'),api.D({token:this.props.token,uid:this.props.param}))
        .then(response => {
            if (api.V(response.data)) {
                let result = response.data.result,
                    len = result.length,
                    tempLen = 0,
                    itemCount = 0,
                    amount = 0;
                console.log(result);
                for (let i = 0;i < len;++i) {
                    this.state.category.push({key:i,value:result[i].cate_name});
                    this.state.item.push(result[i].items);
                    tempLen = result[i].items.length;
                    for (let j = 0;j < tempLen;++j) {
                        itemCount = result[i].items[j].item_count;
                        if (itemCount > 0) {
                            for (let c = 0;c < itemCount;++c) {
                                amount = tool.sum(amount, result[i].items[j].item_real_price);
                                this.state.data.push( tool.getObjectByValue(result[i].items[j]) );
                            }
                        }
                    }
                }
                this.setState({category:this.state.category,item:this.state.item,data:this.state.data,amount:amount});
            }
        });
    }
    handleDeleteClick(dom, index) {
        if (tool.isSet(dom)) {
            dom.onclick = (e => {
                this.state.data.splice(index, 1);
                this.setState({data:this.state.data,handleIndex:null});
                e.stopPropagation()
            });
        }
    }
    handleTabClick(e) {this.setState({index:e.target.dataset.key,clothesShow:true})}
    handleClothesClick(index) {
        let item = tool.getObjectByValue(this.state.item[this.state.index][index]);
        this.state.data.push(item);
        this.setState({
            data:this.state.data,
            clothesShow:false,
            trace:'color',
            type:'color',
            handleIndex:(this.state.data.length - 1),
            amount:( tool.sum(this.state.amount,item.item_real_price) )
        });
    }
    handleSnChange(e) {
        if (null !== this.state.handleIndex) {
            this.state.data[this.state.handleIndex].clean_sn = e.target.value;
            this.setState({data:this.state.data});
        }
    }
    handleTakeTime(date, time) {
        console.log(date);
        console.log(time);
        if (null !== this.state.handleIndex) {
            this.state.data[this.state.handleIndex].take_time = date + ' ' + time;
            this.setState({data:this.state.data, takeTimeShow:false});
        }
    }
    handleCraftDes(e) {
        if (null !== this.state.handleIndex) {
            this.state.data[this.state.handleIndex].craft_des = e.target.value;
            this.setState({data:this.state.data});
        }
    }
    handleCraftPrice(e) {
        if (null !== this.state.handleIndex) {
            let value = e.target.value;
            if (isNaN(value)) return;
            this.state.data[this.state.handleIndex].craft_price = value;
            this.setState({data:this.state.data});
        }
    }
    handleKeepPrice(e) {
        if (null !== this.state.handleIndex) {
            let value = e.target.value;
            if (isNaN(value)) return;
            this.state.data[this.state.handleIndex].keep_price = value;
            this.setState({data:this.state.data});
        }
    }
    handleProblemSubmit(value, options) {
        if (null !== this.state.handleIndex) {
            this.state.data[this.state.handleIndex][this.state.type] = {options:options,content:value};
            let type = null;
            if ('color' == this.state.trace && 'color' == this.state.type) type = 'problem';
            this.setState({data:this.state.data,type:type,trace:type});
        }
    }
    handleImageDelete(index) {
        if (null !== this.state.handleIndex) {
            this.state.images[this.state.handleIndex].splice(index, 1);
            this.setState({images:this.state.images});
        }
    }
    handleImageChoose(base64) {
        if (null !== this.state.handleIndex) {
            if (tool.isSet(this.state.images[this.state.handleIndex])) {
                this.state.images[this.state.handleIndex].push(base64);
            } else {
                this.state.images[this.state.handleIndex] = [base64];
            }
            this.setState({images:this.state.images});
        }
    }
    handleSubmit(e) {
        let data = this.state.data,
            len = data.length,
            type = e.target.dataset.type;
        if (len < 1) return;
        let request = [],
            requestData = {token:this.props.token,uid:this.props.param},
            temp = {},
            tempLen,tempArr;
        for (let i = 0;i < len;++i) {
            if (!tool.isSet(data[i].clean_sn)) return alert('尚有项目未填写衣物编码!');
            if (!tool.isSet(data[i].take_time)) return alert('尚有项目选择取衣时间');
            if (!tool.isSet(this.state.images[i]) || this.state.images[i].length < 1) return alert('尚有项目未上传图片');
            if (!tool.isSet(data[i].color)) return alert('尚有项目未选择颜色!');
            if (!tool.isSet(data[i].problem)) return alert('尚有项目未选择问题!');
            temp = {
                item_id:data[i].id,
                clean_sn:data[i].clean_sn,
                color:JSON.stringify(data[i].color),
                problem:JSON.stringify(data[i].problem),
                forecast:( tool.isSet(data[i].forecast) ? JSON.stringify(data[i].forecast) : JSON.stringify({options:[],content:''}) ),
                keep_price:( tool.isSet(data[i].keep_price) ? data[i].keep_price : 0),
                craft_price:( tool.isSet(data[i].craft_price) ? data[i].craft_price : 0 ),
                craft_des:( tool.isSet(data[i].craft_des) ? data[i].craft_des : '' )
            };
            tempLen = this.state.images[i].length;
            for (let j = 0;j < tempLen;++j) {
                tempArr = this.state.images[i][j].toBase64();
                requestData[i + '_' + j] = tempArr[1].base64toBlob(tempArr[0]);
            }
            request.push(temp);
        }
        this.setState({loadingShow:true});
        requestData.items = JSON.stringify(request);
        axios.post(api.U('item_submit'), api.D(requestData))
        .then(response => {
            if (api.V(response.data)) {
                if ('take_pay' == type) {
                    ipcRenderer.send(
                        'print-silent',
                        'public/prints/index.html',
                        {token:this.props.token,oid:response.data.result,url:api.U('order_print')}
                    );
                    this.props.changeView({view:'index'});
                } else {
                    this.props.changeView({view:'order_pay',param:response.data.result});
                }
            } else {
                this.setState({loadingShow:false});
                alert(response.data.msg);
            }
        });
    }

    render() {
        let tabs = this.state.category.map(obj => 
                <span
                    key={obj.key}
                    data-key={obj.key}
                    className='m-tab checked'
                    onClick={this.handleTabClick}
                >{obj.value}</span>
            );
        let html = this.state.data.map((obj, index) => 
                <tr
                    key={index}
                    className={'m-text-c m-pointer' + ( this.state.handleIndex == index ? ' oai-checked' : '' )}
                    onClick={() => this.setState({handleIndex:index})}
                >
                    <td>{obj.item_name}</td>
                    <td>{obj.clean_sn}</td>
                    <td>{obj.item_real_price}</td>
                    <td>{obj.keep_price}</td>
                    <td>{obj.craft_price}</td>
                    <td>
                        <button
                            type='button'
                            className='m-btn confirm'
                            onClick={() => this.setState({handleIndex:index,uploadShow:true})}
                            data-index={index} 
                        >上传照片</button>
                        &nbsp;&nbsp;
                        <button
                            type='button'
                            className='m-btn editor'
                            ref={dom => this.handleDeleteClick(dom, index)}
                            data-index={index} 
                        >删除</button>
                    </td>
                </tr>
            );
        let name = '',sn = '', color = '', problem = '', forecast = '',keep_price = '',craft_price = '',craft_des = '',take_time = '',images = [];
        if (null !== this.state.handleIndex) {
            let item = this.state.data[this.state.handleIndex];
            name = item.item_name;
            sn = tool.isSet(item.clean_sn) ? item.clean_sn : '';
            color = tool.isSet(item.color) ? tool.objToString(item.color): '';
            problem = tool.isSet(item.problem) ? tool.objToString(item.problem): '';
            forecast = tool.isSet(item.forecast) ? tool.objToString(item.forecast): '';
            keep_price = tool.isSet(item.keep_price) ? item.keep_price : '';
            craft_price = tool.isSet(item.craft_price) ? item.craft_price : '';
            craft_des = tool.isSet(item.craft_des) ? item.craft_des : '';
            take_time = tool.isSet(item.take_time) ? item.take_time : '';
            images = tool.isSet(this.state.images[this.state.handleIndex]) ? this.state.images[this.state.handleIndex] : [];
        }
        return (
            <div>
                <Crumb data={[{key:0,value:'收件',view:'take'},{key:1,value:'添加项目'}]} callback={this.props.changeView}/>
                <div className='m-container'>
                    <div>{tabs}</div>
                    <div className='m-box oai-tab-box'>
                        <Item
                            name={name}
                            sn={sn}
                            take_time={take_time}
                            onChange={this.handleSnChange}
                            onClick={() => {null !== this.state.handleIndex && this.setState({takeTimeShow:true})}}
                        />
                        <ItemInfo
                            color={color}
                            problem={problem}
                            forecast={forecast}
                            handleColor={() => ( null !== this.state.handleIndex && this.setState({type:'color'}) )}
                            handleProblem={() => ( null !== this.state.handleIndex && this.setState({type:'problem'}) )}
                            handleForecast={() => ( null !== this.state.handleIndex && this.setState({type:'forecast'}) )}
                        />
                        <ItemCost
                            keep_price={keep_price}
                            craft_price={craft_price}
                            craft_des={craft_des}
                            handleKeepPrice={this.handleKeepPrice}
                            handleCraftPrice={this.handleCraftPrice}
                            handleCraftDes={this.handleCraftDes}
                        />
                    </div>
                    <div className='m-box'>
                        <table className='m-table tr-b'>
                            <thead><tr className='m-text-c m-bg-white'>
                                <th>名称</th><th>衣物编码</th><th>价格</th><th>保值清洗费</th><th>工艺加价</th><th>操作</th>
                            </tr></thead>
                            <tbody>{html}</tbody>
                        </table>
                    </div>
                    <div className='m-box'>
                        共&nbsp;<span className='m-red'>{this.state.data.length}</span>&nbsp;件
                        &emsp;
                        总价：<span className='m-red'>{this.state.amount}</span>
                    </div>
                    <div className='m-box'>
                        <button type='button' className='m-btn confirm middle' data-type='take_pay' onClick={this.handleSubmit}>取衣付款</button>
                        &emsp;
                        <button type='button' className='m-btn confirm middle' data-type='pay' onClick={this.handleSubmit}>立即付款</button>
                    </div>
                </div>
                <Clothes
                    show={this.state.clothesShow}
                    title={(this.state.category.length > 0 ? this.state.category[this.state.index].value : null)}
                    data={(this.state.item.length > 0 ? this.state.item[this.state.index] : [])}
                    onClick={this.handleClothesClick}
                    onCloseRequest={() => this.setState({clothesShow:false})}
                />
                <Problem
                    type={this.state.type}
                    onCloseRequest={() => this.setState({type:null})}
                    onConfirmRequest={this.handleProblemSubmit}
                />
                <UploadToast
                    show={this.state.uploadShow}
                    images={images}
                    onDelete={this.handleImageDelete}
                    onChoose={this.handleImageChoose}
                    onClose={() => this.setState({uploadShow:false})}
                />
                <Loading show={this.state.loadingShow} notice='图片上传中......'/>
                <TakeTime
                    show={this.state.takeTimeShow}
                    onClose={() => this.setState({takeTimeShow:false})}
                    onClick={this.handleTakeTime}
                />
            </div>
        );
    }
}