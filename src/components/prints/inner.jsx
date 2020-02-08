import React from 'react';
import {Table, Tag, Layout, message} from 'antd';
import m from 'moment';
import qs from 'qs';
import $ from '../../ajax';
export default class PrintInner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: []
    }
  }
  listAction() {
    const ids = qs.parse(this.props.location.search.slice(1)).ids.split(',');
    if(!ids.length) {
      message.error('没有导出的数据');
      return;
    }
    $.get('/inners', {ids}).then(res => {
      if(res.code === 0) {
        this.setState({
          dataSource: res.data
        }, () => {
          window.print();
        })
      }
    })
  }
  componentDidMount() {
    this.listAction();
  }
  render() {
    return (
      <div style={{padding: 10}}>
        <Table
          footer={
            (data) => {
              return (
                <React.Fragment>
                  <b>统计:</b>
                  <span style={{marginLeft: 10}}>{`总重量:${data.reduce((a, b) => a + b.count, 0) }斤; 总金额:${data.reduce((a, b) => a + b.payTotal, 0)}元`}</span>
                </React.Fragment>
              )
            }
          }
          title={() => {
            return (
              <React.Fragment>
                <h2>入库单</h2>
                <span>打印时间: {m().format('YYYY-MM-DD HH:mm:ss')}</span>
              </React.Fragment>
            )
          }}
          dataSource={this.state.dataSource}
          columns={columns}
          size='middle'
          bordered
          pagination={false}
        ></Table>
      </div>
    )
  }
}

const columns = [
  {
    title: '序号',
    render: (t, d, index) => index + 1
  },
  {
    title: '订单号',
    dataIndex: '_id'
  },
  {
    title: '种类',
    dataIndex: 'fruit.title'
  },
  {
    title: '总储量',
    dataIndex: 'fruit.total',
  },
  {
    title: '总重量',
    dataIndex: 'count',
    key: 'count',
    render: d => `${d} 斤`
  },
  {
    title: '损耗',
    dataIndex: 'lost'
  },
  {
    title: '余量',
    dataIndex: 'store',
    render: d => `${d} 斤`
  },
  {
    title: '数量',
    dataIndex: 'packCount'
  },
  {
    title: '规格',
    render: d => {
      if(!d.unit) return '无';
      return `${d.unitCount} 斤/${d.unit.title}`;
    }
  },
  {
    title: '入库价格(元)',
    dataIndex: 'price',
    key: 'price'
  },
  {
    title: '入库人员',
    dataIndex: 'creater',
    key: 'creater',
    render: d => d && d.acount
  },
  {
    title: '供应商',
    dataIndex: 'puller',
    key: 'puller',
    render: d => d && d.title
  },
  {
    title: '入库时间',
    dataIndex: 'createdAt',
    render: d => m(d).format('YYYY-MM-DD')
  },
  {
    title: '总金额',
    dataIndex: 'payTotal',
    render: d => `${d.toFixed(2)}元`
  },
  {
    title: '已付金额',
    dataIndex: 'payNumber',
    render: d => `${d}元`
  },
  {
    title: '付款情况',
    key: 'payStatu',
    render: d => {
      let s = '';
      switch(d.payStatu) {
        case 1:
        s = <Tag color="red">未付款</Tag>;
        break;
        case 2 :
        s = <Tag color="green">已付款</Tag>;
        break;
      }
      return s;
    }
  }
];
