import React, { Component } from 'react';
import { DatePicker, Layout, Pagination, Modal, Table, Tag, Progress, Select, Button, Icon, Upload, Form, Input } from 'antd';
import $ from '../../ajax';
import m from 'moment';
import _ from 'lodash';
import InnerModal from './InnerModal';

export default class Inner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inners: [],
      id: null,
      selected: []
    }
  }

  okInnerModalAction() {
    this.cancelModelAction('inner');
    this.listAction();
  }

  listAction() {
    $.get('/inners', {limit: 100, filterTotal: 1, fruit: this.props.id}).then(res => {
      if(res.code === 0) {
        this.setState({
          inners: res.data
        })
      }
    })
  }
  rowSelectionChangeAction(selected) {
    this.setState({
      selected
    })
  }

  okAction() {
    this.props.onOk(this.state.selected);
  }

  componentWillMount() {
    this.listAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
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
      }
    ];
    return (
      <Modal
        title="入库信息"
        width= '80%'
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Table rowSelection={{type: 'radio', onChange: this.rowSelectionChangeAction.bind(this)}} rowKey="_id" scroll={{x: true}} onRow={r => {return {onClick: e => {} }}} columns={columns} dataSource={this.state.inners} size="middle" bordered pagination={false}/>
      </Modal>
    )
  }
}
