/**
 * 菜单导航栏配置
 * @author yangyunlong
 */
export default [
    {
        id:'order',
        text:'线上订单',
        options:[
            {text:'订单处理',key:'online'}
        ]
    },
    {
        id:'finance',
        text:'线下收银',
        options:[
            {text:'收件',key:'take'},
            {text:'入厂',key:'infactory'},
            {text:'清洗',key:'offline_clean'},
            {text:'烘干',key:'offline_drying'},
            {text:'熨烫',key:'offline_ironing'},
            {text:'质检',key:'offline_check'},
            {text:'上挂',key:'registration'},
            {text:'出厂',key:'outfactory'},
            {text:'取衣',key:'offline_take'},
            {text:'返流审核',key:'offline_take2'},
            {text:'会员管理',key:'member_manage'},
            {text:'业务统计',key:'offline_statistic'}
        ]
    },
    {
        id:'manage',
        text:'商家管理',
        options:[
            {text:'商品管理',key:'goods'},
            {text:'财务对账',key:'finance'},
            {text:'经营分析',key:'operate'},
            {text:'订单查询',key:'order_search'},
            {text:'员工管理',key:'clerk_manage'},
            {text:'返现记录',key:'award'},
            {text:'消息通知',key:'message'},
            {text:'用户评价',key:'appraise'},
            {text:'连锁门店',key:'info2'},
            {text:'门店信息',key:'info'},
            {text:'合作门店',key:'teamwork'},
            {text:'卡券中心',key:'coupon'}
        ]
    }
];
