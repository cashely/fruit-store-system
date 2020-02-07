import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, Radio} from 'antd';
import $ from '../../ajax';
import _ from 'lodash';
export default class LostModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        lost: 0
      },
      order: {
        store: 0
      }
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
    $.post(`/order/lost/${this.props.id}`, this.state.fields).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.props.onCancel();
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
          order: res.data
        })
      }
    })
  }
  componentWillMount() {
    this.props.id && this.detailAction();
  }
  render() {
    const {Item} = Form;
    return (
      <Modal
        title="损耗"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="损耗数量">
            <Input style={{width: 200}} value={this.state.fields.lost} onChange={(e) => this.changeAction('lost', e)} suffix='斤' />
            <span style={{marginLeft: 10}}>剩余数量: {this.state.order.store}斤</span>
        </Item>
        </Form>
      </Modal>
    )
  }
}
