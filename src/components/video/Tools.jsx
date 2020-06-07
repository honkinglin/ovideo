import React, { useState } from 'react';
import {
    RetweetOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { Popover, Button } from 'antd';

const VIDEO_SPEEDS = [2, 1.75, 1.5, 1.25, 1, 0.75];

export default function Tools(props) {
    const { playVideo, setPlayVideo, playList, videoRef } = props;
    const [playSpeed, setPlaySpeed] = useState(1);

    function onSpeedChange(speed) {
        if (!playVideo) return;

        videoRef.current.playbackRate = parseFloat(speed);
        setPlaySpeed(speed);
    }

    return (
        <div className="o-video__ctrs-tools">
            <div className="tools-body">
                {
                    playList.length ? (
                        <ul className="tools-list">
                            {
                                playList.map((item) => (
                                    <li
                                        className="item"
                                        key={item.url}
                                        onClick={() => setPlayVideo(item.url)}
                                    >{item.name}</li>
                                ))
                            }
                        </ul>
                    ) : (
                        <div className="tools-list-empty">
                            <UnorderedListOutlined style={{ fontSize: 26, margin: 12 }} />
                            <p>当前播放列表为空</p>
                        </div>
                    )
                }
            </div>
            <div className="tools-footer">
                <RetweetOutlined className="icon-loop" />
                <Popover
                    title="倍速播放"
                    placement="topRight"
                    overlayClassName="speeds-popup"
                    content={(
                        <ul className="speeds-list">
                            {
                                VIDEO_SPEEDS.map((speed) => (
                                    <li
                                        key={speed}
                                        className="item"
                                        onClick={() => onSpeedChange(speed)}
                                    >{speed}x</li>
                                ))
                            }
                        </ul>
                    )}
                >
                    <Button size="small" disabled={!playVideo} style={{ width: 60 }}>{playSpeed}x</Button>
                </Popover>
            </div>
        </div>
    )
}
