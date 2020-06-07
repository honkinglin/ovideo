import React, { useState, useRef } from 'react';
import {
    YoutubeOutlined,
    SettingOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import { Popover } from 'antd';
import Tools from './Tools';
import LinkModal from './LinkModal';
import './style.less';

export default function Video() {
    const [playVideo, setPlayVideo] = useState(null);
    const [toolVisible, setToolVisible] = useState(false);
    const [playList, setPlayList] = useState([]);
    const [isDraging, setIsDraging] = useState(false);
    const [linkVisible, setLinkVisible] = useState(false);

    const videoRef = useRef();

    function fileChange(e) {
        const file = e.target.files[0];
        const filePath = URL.createObjectURL(file);
        setPlayVideo(filePath);
        setPlayList(playList.concat({
            url: filePath,
            name: file.name,
        }));
    }

    function onDropHandler(e) {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        const filePath = URL.createObjectURL(file);
        setPlayVideo(filePath);
        setPlayList(playList.concat({
            url: filePath,
            name: file.name,
        }));
    }

    function handleLinkModalOk(url) {
        setLinkVisible(false);
        setPlayVideo(url);
        const name = url.split('/').slice(-1)[0];
        setPlayList(playList.concat({ url, name }));
    }

    function render() {
        return (<div className="o-video">
            {
                playVideo ? (
                    <video
                        controls
                        crossOrigin="anonymous"
                        className="o-video__tag"
                        ref={videoRef}
                        src={playVideo}
                    ></video>
                ) : (
                    <label
                        draggable
                        htmlFor="file"
                        className='o-video__empty'
                        onDragEnter={() => setIsDraging(true)}
                        onDragLeave={() => setIsDraging(false)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={onDropHandler}
                    >
                        <YoutubeOutlined style={{ fontSize: 80 }} />
                        <span>{isDraging ? '松开文件' : '点击或拖拽视频文件'}</span>
                        <input
                            id="file"
                            type="file"
                            accept="video/*"
                            onChange={fileChange}
                        />
                    </label>
                )
            }
            <Popover
                placement="bottomRight"
                overlayClassName="tools-popup"
                title="播放列表"
                content={
                    <Tools
                        videoRef={videoRef}
                        playList={playList}
                        playVideo={playVideo}
                        setPlayVideo={setPlayVideo}
                    />
                }
                trigger="click"
                visible={toolVisible}
                onVisibleChange={setToolVisible}
            >
                <SettingOutlined className="o-video__ctrs"/>
            </Popover>

            <LinkOutlined
                className="o-video__link"
                onClick={() => setLinkVisible(true)}
            />
            <LinkModal
                visible={linkVisible}
                setVisible={setLinkVisible}
                handleOk={handleLinkModalOk}
                onCancel={() => setLinkVisible(false)}
            />
        </div>)
    }

    return render();
}
