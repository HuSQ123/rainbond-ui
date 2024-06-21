import {
  Row,
  Col,
  Collapse,
  Button,
  Icon,
} from 'antd'
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage  } from 'umi-plugin-locale';
import styles from '../ClusterComponents/index.less'

const { Panel } = Collapse;

@connect(({ global }) => ({
  enterprise: global.enterprise
}))
export default class ShowNodeComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentDidMount () {
    this.fetchClusterStatus()
  }
  fetchClusterStatus = () => {
    const { dispatch, cluster_id, enterprise: { enterprise_id }} = this.props
    dispatch({
      type: 'region/fetchClusterStatus',
      payload: {
        enterprise_id,
        clusterID: cluster_id
      },
      callback: res => {
        console.log(res)
      }
    })
  }
  render() {
    const reloadBtn = (
      <Button style={{ float: 'right' }} onClick={this.handleReload}>
        <Icon type="reload" />
      </Button>
    );
    return (
      <div style={{padding: '50px 16px 16px'}}>
        <Row>
          <Col style={{paddingBottom: 16}}>
            <Collapse expandIconPosition='right'>
              <Panel header="节点列表" key="1">
              <Row className={styles.customTablesTit}>
                    <Col span={3}><FormattedMessage id='enterpriseColony.ClusterComponents.state' /></Col>
                    <Col span={7}><FormattedMessage id='enterpriseColony.ClusterComponents.name' /></Col>
                    <Col span={14}><FormattedMessage id='enterpriseColony.ClusterComponents.image' />{reloadBtn}</Col>
                  </Row>
              </Panel>
            </Collapse>
          </Col>
          <Col>
            <Collapse expandIconPosition='right'>
              <Panel header="K8s集群组件" key="1">
                <div className={styles.customTables}>
                  <Row className={styles.customTablesTit}>
                    <Col span={3}><FormattedMessage id='enterpriseColony.ClusterComponents.state' /></Col>
                    <Col span={7}><FormattedMessage id='enterpriseColony.ClusterComponents.name' /></Col>
                    <Col span={14}><FormattedMessage id='enterpriseColony.ClusterComponents.image' />{reloadBtn}</Col>
                  </Row>
                  {/* <div className={styles.boxs}>
                    {list && list.length ? (
                      list.map(item => {
                        const { app, pods } = item;
                        return (
                          <Row>
                            <Row className={styles.customTableMinTit}>{app}</Row>
                            {pods && pods.length > 0 ? (
                              pods.map(items => {
                                const { status, metadata, spec } = items;
                                return (
                                  <Row className={styles.customTableCon}>
                                    <Col span={3}>
                                      <div
                                        className={this.handleStateName(
                                          status && status.phase
                                        )}
                                      >
                                        {status && status.phase}
                                      </div>
                                    </Col>
                                    <Col span={7}>
                                      <a
                                        onClick={() => {
                                          this.handleComponentDetails(
                                            Object.assign({}, items, { app })
                                          );
                                        }}
                                      >
                                        {metadata && metadata.name}
                                      </a>
                                    </Col>
                                    <Col span={14}>
                                      <div>
                                        {spec &&
                                          spec.containers &&
                                          spec.containers.length > 0 &&
                                          spec.containers[0].image}
                                      </div>
                                      <div>
                                        <span style={{ color: '#4d73b1' }}>
                                          {status && status.hostIP}
                                          {slash}
                                        </span>

                                        <span style={{ color: '#4d73b1' }}>
                                          {spec && spec.nodeName}
                                          {slash}
                                        </span>
                                        <span
                                          style={{ color: 'rgba(0, 0, 0, 0.35)' }}
                                        >
                                          <FormattedMessage id='enterpriseColony.ClusterComponents.Time' />
                                          {metadata &&
                                            metadata.creationTimestamp &&
                                            moment(
                                              metadata.creationTimestamp
                                            ).format('YYYY-MM-DD HH:mm:ss')}
                                        </span>
                                        <span
                                          style={{ color: 'rgba(0, 0, 0, 0.35)' }}
                                        >
                                          &nbsp;/&nbsp; <FormattedMessage id='enterpriseColony.ClusterComponents.number' />
                                          {status &&
                                            status.containerStatuses &&
                                            status.containerStatuses.length &&
                                            status.containerStatuses[0]
                                              .restartCount}
                                        </span>
                                      </div>
                                    </Col>
                                  </Row>
                                );
                              })
                            ) : (
                              <div
                                style={{ marginTop: '12px', textAlign: 'center ' }}
                              >
                                <FormattedMessage id='enterpriseColony.ClusterComponents.Pods' />
                              </div>
                            )}
                          </Row>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          textAlign: 'center',
                          color: 'rgba(0,0,0,0.35)',
                          marginTop: '15px'
                        }}
                      >
                        <FormattedMessage id='enterpriseColony.ClusterComponents.created' />
                      </div>
                    )}
                  </div> */}
                </div>
              </Panel>
            </Collapse>
          </Col>
        </Row>
      </div>
    )
  }
}
