import React, { useState, useRef } from 'react';
import {
    YoutubeOutlined,
    SettingOutlined,
    RetweetOutlined,
    UnorderedListOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import { Popover, Button } from 'antd';
import './style.less';

const VIDEO_SPEEDS = [2, 1.75, 1.5, 1.25, 1, 0.75];

export default function Video() {
    const [playVideo, setPlayVideo] = useState(null);
    const [toolVisible, setToolVisible] = useState(false);
    const [playList, setPlayList] = useState([]);
    const videoRef = useRef();

    function fileChange(e) {
        console.dir(e.target)
        const file = e.target.files[0];
        const filePath = URL.createObjectURL(file);
        setPlayVideo(filePath);
        setPlayList(playList.concat({
            url: filePath,
            name: file.name,
        }));
        console.log(filePath);
    }

    function onSpeedChange(speed) {
        if (!playVideo) return;
        videoRef.current.playbackRate = parseFloat(speed);
    }

    function renderTools() {
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
                        <Button size="small" disabled={!playVideo} style={{ width: 60 }}>1x</Button>
                    </Popover>
                </div>
            </div>
        )
    }

    function render() {
        return (<div className="o-video">
            {
                playVideo ? (
                    <video className="o-video__tag" ref={videoRef} src={playVideo} controls></video>
                ) : (
                    <label htmlFor="file" className="o-video__empty">
                        <YoutubeOutlined style={{ fontSize: 80 }} />
                        <span>点击或拖拽视频文件</span>
                        <input type="file" id="file" accept="video/*" onChange={fileChange} />
                    </label>
                )
            }
            <Popover
                placement="bottomRight"
                overlayClassName="tools-popup"
                title="播放列表"
                content={renderTools()}
                trigger="click"
                visible={toolVisible}
                onVisibleChange={setToolVisible}
            >
                <SettingOutlined className="o-video__ctrs"/>
            </Popover>
            <LinkOutlined className="o-video__link" />
        </div>)
    }

    return render();
}
