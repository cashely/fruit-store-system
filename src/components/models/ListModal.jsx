import React from 'react';
import {Modal, Table} from 'antd';
export default class ListModal extends React.Component {
  render() {
    const {columns, dataSource, visible, width = 520} = this.props;
    return (
      <Modal
        title="退货信息"
        visible={visible}
        footer={null}
        onCancel={this.props.onCancel}
        width={width}
      >
        <Table rowKey="_id" columns={columns} dataSource={dataSource} size="middle" bordered pagination={false}/>
      </Modal>
    )
  }
}
