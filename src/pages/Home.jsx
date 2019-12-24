import React, { Component } from 'react';
import { DatePicker, Layout, Card, Row, Col, Pagination, Statistic, Table, Tag, Progress, Button, Icon, Upload } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import GroupModal from '../components/GroupModal';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      fruits: [],
      total: 0,
      gid: null,
      groupVisable: false,
      outersMonth: []
    }
  }
  rowClickAction(id) {
    this.props.history.push(`/detail-list/${id}`)
  }

  fruitsAction() {
    $.get('/fruits').then(res => {
      if(res.code === 0) {
        this.setState({
          fruits: res.data
        })
      }
    })
  }

  showGroupAction(gid) {
    this.setState({
      gid,
      groupVisable: true
    })
  }

  hideGroupAction() {
    this.setState({
      gid: null,
      groupVisable: false
    })
  }
  ordersAction() {
    $.get('/orders').then(res => {
      if(res.code === 0) {
        this.setState({
          orders: res.data
        })
      }
    });
    $.get('/orders/total').then(res => {
      if(res.code === 0) {
        this.setState({
          total: res.data
        })
      }
    })
  }

  groupOkAction(group) {
    const promise = group._id ? $.put(`/group/${group._id}`, group) : $.post('/group/', group);
    promise.then(res => {
      if(res.code === 0) {
        this.hideGroupAction();
        this.groupsAction();
      }
    })
  }

  outersMonthAction() {
    $.get(`/outers?createdAt=${m().startOf('month').format('YYYY-MM-DD')}`).then(res => {
      if(res.code === 0) {
        this.setState({
          outersMonth: res.data
        })
      }
    })
  }

  componentWillMount() {
    this.ordersAction();
    this.fruitsAction();
    this.outersMonthAction();
  }
  render() {
    const {Content, Footer, Header} = Layout;
    const columns = [
      {
        title: '序号',
        render: (t, d, index) => index + 1
      },
      {
        title: '种类',
        dataIndex: 'fruit.title',
      },
      {
        title: '总储量',
        dataIndex: 'fruit.total',
      },
      {
        title: '类型',
        dataIndex: 'type',
        render: d => {
          let s = '';
          switch(d) {
            case 1:
            s = <Tag color="red">入库</Tag>;
            break;
            case 2 :
            s = <Tag color="green">出库</Tag>;
            break;
          }
          return s;
        }
      },
      {
        title: '数量',
        dataIndex: 'count',
      },
      {
        title: '价格',
        render: d => d.type === 1 ? d.fruit.innerPrice : d.fruit.outerPrice
      },
      {
        title: '更新时间',
        dataIndex: 'createdAt',
        render: d => m(d).format('YYYY-MM-DD')
      },
      {
        title: '操作',
        align: 'center',
        render: row => (
          <React.Fragment>
            <Button type="primary" onClick={(e) => {e.stopPropagation(); this.showGroupAction(row._id)}} size="small"><Icon type="edit"/></Button>
          </React.Fragment>
        )
      }
    ];
    return (
      <Layout style={{height: '100%'}}>
        <Content>
          <Layout>
            <Content>
                <Row gutter={10}>
                  <Col span={14}>
                    <Card title="价格看板">
                      {
                        this.state.fruits.map(fruit => <Card.Grid style={GridStyle}><Statistic title={`入库:￥${fruit.innerPrice} 出库:￥${fruit.outerPrice}`} key={fruit._id} value={fruit.title}/></Card.Grid>)
                      }
                    </Card>
                  </Col>
                  <Col span={10}>
                    <Card>
                      <PieChart dataSource={this.state.fruits}/>
                      <PieChart dataSource={this.state.outersMonth}/>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Layout style={{marginTop: 10, backgroundColor: '#fff'}}>
                      <Header style={{backgroundColor: '#fff', padding: 10, height: 'auto', lineHeight: 1}}>
                        <Button type="primary" onClick={this.showGroupAction.bind(this)}><Icon type="download"/>新增库存</Button>
                        <Button type="primary" style={{marginLeft: 10}} disabled><Icon type="download"/>导出报告</Button>
                      </Header>
                      <Content style={{overflow: 'auto'}}>
                        <Table rowKey="_id" columns={columns} dataSource={this.state.orders} size="middle" bordered pagination={false}/>
                        {
                          this.state.groupVisable ? <GroupModal gid={this.state.gid} visible={this.state.groupVisable} onOk={this.groupOkAction.bind(this)} onCancel={this.hideGroupAction.bind(this)}/> : null
                        }
                      </Content>
                      <Footer style={{padding: 5, backgroundColor: '#fff'}}>
                        <Pagination defaultCurrent={1} total={this.state.total}/>
                      </Footer>
                    </Layout>
                  </Col>
                </Row>
            </Content>
          </Layout>
        </Content>
      </Layout>
    )
  }
}

let dataSources = []

for(var a = 0; a < 20; a++) {
  dataSources.push({
    id: a,
    title: `测试用例${a+1}`,
    total: 50,
    successed: 20,
    failed: 20,
    undo: 10,
    creater: '张三',
    runtime: '2013-01-01',
    created: '2013-01-02'
  })
}

const GridStyle = {
  width: '25%',
  padding: 5,
  textAlign: 'center'
}
