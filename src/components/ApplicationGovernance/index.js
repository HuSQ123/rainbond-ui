/* eslint-disable prettier/prettier */
import React, { PureComponent } from 'react';
import {
  Form,
  Modal,
  Select,
  Input,
  Alert,
  Table,
  notification,
  Button
} from 'antd';
import { connect } from 'dva';
import globalUtil from '../../utils/global';

const FormItem = Form.Item;
const { Option } = Select;


@Form.create()
@connect(({ loading }) => ({
  checkK8sLoading: loading.effects['appControl/setCheckK8sServiceName'],
  governanceLoading: loading.effects['appControl/setgovernancemode']
}))
export default class ApplicationGovernance extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      page: 1,
      page_size: 6,
      total: 0,
      step: false,
      ServiceNameList: []
    };
  }

  onPageChange = (page) => {
    this.setState({ page }, () => {
      this.fetchServiceNameList();
    });
  };

  setK8sServiceNames = (value) => {
    const { dispatch, appID, onCancel } = this.props;
    const arr = [];
    const apps = this.getSelected();
    apps.map((item) => {
      const {
        service_id: id,
        port_alias: alias,
        service_cname: serviceCname,
        k8s_service_name: name,
        port
      } = item;
      const setAlias = `${id}/${alias}`;
      const k8ServiceName = `${id}/${name}`;
      if (setAlias && k8ServiceName) {
        arr.push({
          service_cname: serviceCname,
          service_id: id,
          port,
          port_alias: value[setAlias],
          k8s_service_name: value[k8ServiceName]
        });
      }
    });
    dispatch({
      type: 'appControl/setCheckK8sServiceName',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID,
        arr
      },
      callback: (res) => {
        if (res && res.bean) {
          this.setState({
            ServiceNameList: res.bean.k8s_service_names
          });
          onCancel();
        }
      }
    });
  };
  getSelected() {
    const { selectedRowKeys, ServiceNameList } = this.state;
    let res = [];
    if (
      selectedRowKeys &&
      selectedRowKeys.length > 0 &&
      ServiceNameList &&
      ServiceNameList.length > 0
    ) {
      res = selectedRowKeys.map((item) => ServiceNameList[item]);
    }
    return res;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { form } = this.props;
    const { step } = this.state;
    form.validateFields((err, value) => {
      if (!err) {
        if (step) {
          // this.checkK8sServiceName({ k8s_service_name: 'graca965_80' });
          this.setK8sServiceNames(value);
        } else {
          this.handleGovernancemode(value);
        }
      }
    });
  };

  handleGovernancemode = (value) => {
    const { dispatch, appID, onCancel } = this.props;
    dispatch({
      type: 'appControl/setgovernancemode',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID,
        governance_mode: value.governance_mode
      },
      callback: () => {
        notification.success({
          message: '切换成功',
          duration: '3'
        });
        if (value.governance_mode === 'BUILD_IN_SERVICE_MESH') {
          onCancel();
        } else {
          this.fetchServiceNameList();
        }
      }
    });
  };

  fetchServiceNameList = () => {
    const { dispatch, appID } = this.props;
    dispatch({
      type: 'appControl/fetchServiceNameList',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID
      },
      callback: (res) => {
        if (res && res.bean) {
          this.setState({
            step: true,
            ServiceNameList: res.list
          });
        }
      }
    });
  };
  checkK8sServiceName = (value) => {
    const { dispatch, appID } = this.props;
    dispatch({
      type: 'appControl/checkK8sServiceName',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID,
        service_alias: value.service_alias,
        k8s_service_name: value.k8s_service_name
      },
      callback: (res) => {
        if (res && res.bean && !res.bean.is_valid) {
          this.setK8sServiceNames();
        }
      }
    });
  };

  isDisabled = () => {
    const app = this.getSelected();
    return app.length > 0;
  };

  checkServiceName = (rule, value, callback) => {
    const { dispatch, appID } = this.props;
    const { ServiceNameList } = this.stata;
    try {
      dispatch({
        type: 'appControl/checkK8sServiceName',
        payload: {
          tenantName: globalUtil.getCurrTeamName(),
          group_id: appID,
          service_alias: ServiceNameList[0].service_alias,
          k8s_service_name: ServiceNameList[0].k8s_service_name
        },
        callback: (res) => {
          if (res && res.bean && !res.bean.is_valid) {
            callback(); // +
          } else {
            throw new Error('格式错误!');
          }
        }
      });
    } catch (err) {
      callback(err);
      return; // +
    }
    callback(); // +
  };
  rowKey = (record, index) => index;

  render() {
    const list = [
      { key: 'KUBERNETES_NATIVE_SERVICE', name: 'Kubernetes原生 service 模式' },
      { key: 'BUILD_IN_SERVICE_MESH', name: '内置 ServiceMesh 模式' }
    ];
    const {
      loading = false,
      onCancel,
      form,
      checkK8sLoading,
      governanceLoading
    } = this.props;
    const { step, ServiceNameList } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const type =
      getFieldValue('governance_mode') || 'KUBERNETES_NATIVE_SERVICE';
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      selectedRowKeys: this.state.selectedRowKeys
    };

    return (
      <Modal
        title="应用治理模式切换"
        visible
        confirmLoading={loading || checkK8sLoading || governanceLoading}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        width={800}
        footer={[
          <Button onClick={onCancel}> 取消 </Button>,
          <Button
            type="primary"
            loading={loading || checkK8sLoading || governanceLoading}
            disabled={step && !this.isDisabled()}
            onClick={this.handleSubmit}
          >
            确定
          </Button>
        ]}
      >
        <Alert
          style={{ marginBottom: '20px' }}
          message="应用治理模式主要指组件见通信模式，目前支持内置ServiceMesh模式和Kubernetes原生Service模式"
          type="info"
          showIcon
        />
        <Form onSubmit={this.handleSubmit}>
          {step ? (
            <Table
              size="middle"
              rowKey={this.rowKey}
              pagination={{
                current: this.state.page,
                pageSize: this.state.page_size,
                total: this.state.total,
                onChange: this.onPageChange
              }}
              dataSource={ServiceNameList || []}
              rowSelection={rowSelection}
              columns={[
                {
                  title: '组件名称/端口',
                  dataIndex: 'service_alias',
                  render: (_, data) => (
                    <div>
                      {data.service_cname}/{data.port}
                    </div>
                  )
                },
                {
                  title: '别名',
                  dataIndex: 'port_alias',
                  render: (val, data) => (
                    <FormItem style={{ marginBottom: 0 }}>
                      {getFieldDecorator(
                        `${data.service_id}/${data.port_alias}`,
                        {
                          initialValue: val || '',
                          rules: [
                            {
                              required: true,
                              message: '不能为空'
                            }
                          ]
                        }
                      )(<Input size="small" />)}
                    </FormItem>
                  )
                },
                {
                  title: '内部域名',
                  dataIndex: 'k8s_service_name',
                  render: (val, data) => (
                    <FormItem style={{ marginBottom: 0 }}>
                      {getFieldDecorator(
                        `${data.service_id}/${data.k8s_service_name}`,
                        {
                          initialValue: val || '',
                          rules: [
                            {
                              required: true,
                              message: '不能为空'
                            },
                            {
                              max: 63,
                              message: '内部域名最多63个位'
                            },
                            {
                              pattern: /^[a-z0-9]([a-z0-9-_]*[-a-z0-9]*[a-z0-9])?$/,
                              message:
                                '必须由小写的字母、数字和- _组成，并且必须以字母数字开始和结束'
                            }
                          ]
                        }
                      )(<Input size="small" />)}
                    </FormItem>
                  )
                }
              ]}
            />
          ) : (
            <div>
              <FormItem
                labelCol={{
                  xs: {
                    span: 14
                  },
                  sm: {
                    span: 8
                  }
                }}
                wrapperCol={{
                  xs: { span: 14, offset: 0 },
                  sm: { span: 8 }
                }}
                label="治理模式选择"
              >
                {getFieldDecorator('governance_mode', {
                  initialValue: 'KUBERNETES_NATIVE_SERVICE',
                  rules: [
                    {
                      required: true,
                      message: '不能为空!'
                    }
                  ]
                })(
                  <Select style={{ width: '357px' }}>
                    {list.map((item) => {
                      return (
                        <Option key={item.key} value={item.key}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <div
                style={{
                  width: '468px',
                  margin: '0 auto',
                  border: '1px solid #ccc',
                  padding: '10px',
                  borderRadius: '8px'
                }}
              >
                <label
                  htmlFor="governance_mode"
                  className="ant-form-item-required"
                  title="模式说明"
                >
                  模式说明
                </label>

                <div style={{ marginTop: '10px' }}>
                  {type === 'KUBERNETES_NATIVE_SERVICE'
                    ? '该模式组件间使用Kubernetes service名称域名进行通信，用户需要配置每个组件端口注册的service名称，治理能力有限。'
                    : '内置ServiceMesh模式需要用户显示的配置组件间的依赖关系，平台会在下游组件中自动注入sidecar容器组成ServiceMesh微服务架构，业务间通信地址统一为localhost模式'}
                </div>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    );
  }
}
