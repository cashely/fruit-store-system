import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class InnerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        fruit: {
          title: ''
        },
        count: 0,
        price: 0,
        payStatu: 1,
        puller: '',
        payNumber: 0,
        avgPrice: 0,
        unit: '',
        unitCount: '',
        packCount: '',
      },
      units: []
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    }, () => {
      if(fieldname === 'fruit') {
        const fruit = _.find(this.state.fruits, {_id: this.state.fields.fruit});
        this.setState({
          fields: Object.assign({}, this.state.fields, {avgPrice: fruit.avgPrice})
        })
      }
      if(fieldname === 'unit' || fieldname === 'packCount' || fieldname === 'unitCount') {
        if(this.state.fields.unit && this.state.fields.packCount && this.state.fields.unitCount) {
          this.setState({
            fields: Object.assign({}, this.state.fields, {count: this.state.fields.packCount * this.state.fields.unitCount})
          })
        }
      }
    })
  }
  okAction() {
    $.post(`/order/back`, this.state.fields).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.props.onOk();
      } else {
        message.error('操作失败');
      }
    })
  }
  detailAction() {
    $.get(`/order/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          fields: res.data
        })
      }
    })
  }

  pullersListAction() {
    $.get('/pullers').then(res => {
      if(res.code === 0) {
        this.setState({
          pullers: res.data
        })
      }
    })
  }

  fruitsListAction() {
    $.get('/fruits').then(res => {
      if(res.code === 0) {
        this.setState({
          fruits: res.data
        })
      }
    })
  }

  unitsListAction() {
    $.get('/units').then(res => {
      if(res.code === 0) {
        this.setState({
          units: res.data
        })
      }
    })
  }

  componentWillMount() {
    this.unitsListAction();
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    const {Option} = Select;
    const unit = (() => {
      if(!this.state.fields.unit) return '';
      const unit = _.find(this.state.units, {_id: this.state.fields.unit});
      if(unit) {
        return unit.title
      }
      return '';
    })()
    return (
      <Modal
        title="退货信息"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="水果名称">
            {this.state.fields.fruit.title}
          </Item>
          <Item label="规格">
            <Input disabled style={{width: 60}} placeholder="数量" value={this.state.fields.unitCount} onChange={(e) => this.changeAction('unitCount', e)} /> 斤 /
            <Select style={{width: 50, marginLeft: 5, marginRight: 10}} value={this.state.fields.unit} showSearch filterOption={(v,s) => s.props.children.includes(v)} onChange={(e) => this.changeAction('unit', e)}>
              {
                this.state.units.map(unit => <Option value={unit._id} key={unit._id} >{unit.title}</Option>)
              }
            </Select>
             数量: <Input value={this.state.fields.packCount} onChange={(e) => this.changeAction('packCount', e)} style={{width: 80}} suffix={unit} />
          </Item>
          <Item label="总重量">
            <Input style={{width: 200}} value={this.state.fields.count} onChange={(e) => this.changeAction('count', e)} suffix='斤' />
          </Item>
        </Form>
      </Modal>
    )
  }
}
