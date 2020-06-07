import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';

const URL_REG = /^(http(s)?:\/\/|\/\/)\w+/;

export default function LinkModal(props) {
    const { setVisible, handleOk, ...restProps } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    function preloadVideo(url) {
        return new Promise((resolve, reject) => {
            const videoEl = document.createElement('video');
            videoEl.setAttribute('playsinline','true');
            videoEl.setAttribute('muted','false');
            videoEl.setAttribute('preload','auto');

            setIsLoading(true);
            videoEl.oncanplay = resolve;
            videoEl.onerror = reject;
            videoEl.src = url;
        });
    }

    function onSearch(url) {
        const isUrl = URL_REG.test(url);
        if (!isUrl) return message.error('请输入合法的地址');

        preloadVideo(url)
            .then(() => setVideoUrl(url))
            .catch(() => {
                message.error('输入的视频地址不可用');
                setVideoUrl('');
            })
            .finally(() => setIsLoading(false));
    }

    const modalFooter = (
        <>
            <Button onClick={() => setVisible(false)}>取 消</Button>
            <Button
                type="primary"
                disabled={!videoUrl}
                onClick={() => handleOk(videoUrl)}
            >打 开</Button>
        </>
    );

    return (
        <Modal
            title="打开在线视频"
            footer={modalFooter}
            { ...restProps }
        >
            <Input.Search placeholder="请输入视频地址" onSearch={onSearch} loading={isLoading} />
            <p style={{ marginTop: 20, textAlign: 'center' }}>输入在线视频的有效URL地址，或者YouTube页面、腾讯视频页面等</p>
        </Modal>
    )
}