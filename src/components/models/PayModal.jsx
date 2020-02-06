import React, {Component} from 'react';
import {Form, Input, Button, Icon, Modal, Select, message, InputNumber, Radio, DatePicker} from 'antd';
import _ from 'lodash';
import $ from '../../ajax';
import moment from 'moment';
export default class ExportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {
        payNumber: 0
      },
      order: {
        payTotal: 0,
        payNumber: 0
      }
    }
  }
  changeAction(fieldname, e) {
    const fields = Object.assign({}, this.state.fields, {[fieldname]: typeof(e) === 'object' ? e.currentTarget.value : e})
    this.setState({
      fields
    });
  }
  okAction() {
    $.post(`/order/pay/${this.props.id}`, this.state.fields).then(res => {
      if(res.code === 0) {
        message.success('操作成功');
        this.props.onCancel();
        this.props.onOk();
      }
    })
  }

  validAction() {
    if(this.state.fields.date.length < 2) {
      message.error('时间段必须填写');
      return false;
    }
    return true;
  }

  orderDetailAction() {
    $.get(`/order/${this.props.id}`).then(res => {
      if(res.code === 0) {
        this.setState({
          order: Object.assign({}, this.state.order, res.data)
        })
      }
    })
  }

  componentDidMount() {
    this.props.id && this.orderDetailAction();
  }

  render() {
    const {Item} = Form;
    return (
      <Modal
        title="付款"
        visible={this.props.visible}
        onOk={this.okAction.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Form layout="horizontal" labelCol={{span: 4}} wrapperCol={{span: 20}}>
          <Item label="应付款项">
            {this.state.order.payTotal}
          </Item>
          <Item label="已付款项">
            {this.state.order.payNumber}
          </Item>
          <Item label="付款金额">
            <Input value={this.state.fields.payNumber} onChange={e => this.changeAction('payNumber', e)} />
          </Item>
        </Form>
      </Modal>
    )
  }
}
