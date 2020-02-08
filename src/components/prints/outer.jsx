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
    $.get('/outers', {ids}).then(res => {
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
                <h2>出库单</h2>
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
    key: 'i',
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
    title: '总重量',
    dataIndex: 'count',
    render: d => `${d.toFixed(2)} 斤`
  },
  {
    title: '数量',
    key: 'packCount',
    render: d => (d.unit && d.unit.title) ? `${d.packCount} ${d.unit.title}` : d.packCount
  },
  {
    title: '规格',
    key: 'b',
    render: d => {
      if(!d.unit) return '无';
      return `${d.unitCount} 斤/${d.unit.title}`;
    }
  },
  {
    title: '出库价格(元)',
    key: 'price',
    render: d => (d.unit && d.unit.title) ? `${d.price} 元/${d.unit.title}` : d.price
  },
  {
    title: '下单数量',
    dataIndex: 'reserve'
  },
  {
    title: '出库人员',
    dataIndex: 'creater',
    render: d => d && d.acount
  },
  {
    title: '送货方',
    dataIndex: 'pusher',
    render: d => d && d.title
  },
  {
    title: '出库时间',
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
    render: d => `${d.toFixed(2)}元`
  },
];
