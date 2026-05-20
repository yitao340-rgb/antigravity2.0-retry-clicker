/**
 * Antigravity 2.0 - Auto Retry Clicker (Premium Class-Based Pure CSS Matcher)
 * 
 * 升级版核心亮点：
 * 1. 【精准】完全摒弃文本匹配，100% 依据特征 CSS 类名进行像素级精准查找。
 * 2. 【便捷】右下角悬浮章新增手动“开启 / 停止”切换按钮，支持一键临时静音。
 * 3. 【优美】iOS 风格暗黑毛玻璃界面，3D 操作动效，科技感拉满。
 * 4. 【稳定】默认重试冷却时间升级为 3 秒，防止接口高频过载。
 */
(function antigravityClicker() {
    // ==========================================
    // 1. 全局清理（防冲突，保障热重启干净）
    // ==========================================
    if (window.__antigravityStopClicker) {
        window.__antigravityStopClicker();
    }

    // ==========================================
    // 2. 初始化配置参数 (读取本地存储或默认值)
    // ==========================================
    let settings = {
        cooldown: 3000 // 默认冷却时间修改为 3 秒 (3000ms)
    };

    try {
        const saved = localStorage.getItem('antigravity_clicker_settings');
        if (saved) {
            settings = Object.assign(settings, JSON.parse(saved));
        }
    } catch (e) {
        console.error("加载点击器配置失败:", e);
    }

    const COOLDOWN_MS = settings.cooldown;
    let isPaused = false; // 手动停止/开启标识

    console.log(
        `%c🟢 Antigravity Auto-Clicker Active!\n` +
        `%c当前配置 - 默认冷却: ${COOLDOWN_MS}ms | 精准类特征查找模式 (不匹配文本)\n` +
        `💡 提示：点击右下角悬浮窗的 [⏸️ 停止] / [▶️ 开启] 按钮可直接手动控制；点击文字区域可修改参数！`,
        "color: #30d158; font-weight: bold; font-size: 14px;",
        "color: #b0bec5; font-size: 12px;"
    );

    // 记录运行时数据
    let lastClicked = 0;
    if (typeof window.__antigravityClickCount === 'undefined') {
        window.__antigravityClickCount = 0;
    }
    let currentClickerState = 'active'; // active, clicking, cooldown, stopped

    // ==========================================
    // 3. 动态加载 Premium CSS 样式与动画
    // ==========================================
    const styleSheet = document.createElement("style");
    styleSheet.id = 'antigravity-clicker-styles';
    styleSheet.innerText = `
        /* 呼吸灯动画 */
        @keyframes clickerPulse {
            0% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px rgba(48, 209, 88, 0.6); }
            50% { transform: scale(1.2); opacity: 0.7; box-shadow: 0 0 16px rgba(48, 209, 88, 0.9); }
            100% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px rgba(48, 209, 88, 0.6); }
        }

        /* 弹窗遮罩层淡入 */
        @keyframes clickerFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* 弹窗卡片缩放弹出 */
        @keyframes clickerScaleUp {
            from { transform: scale(0.9) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* 悬浮章主体 */
        #antigravity-clicker-badge {
            position: fixed;
            bottom: 75px;
            right: 20px;
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: rgba(28, 28, 30, 0.72);
            backdrop-filter: blur(20px) saturate(190%);
            -webkit-backdrop-filter: blur(20px) saturate(190%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 7px 14px;
            color: #f5f5f7;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            user-select: none;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        #antigravity-clicker-badge:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            border-color: rgba(255, 255, 255, 0.16);
            background-color: rgba(38, 38, 40, 0.82);
        }

        #antigravity-clicker-badge:active {
            transform: translateY(0) scale(0.97);
        }

        #antigravity-clicker-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        /* 悬浮窗上新增的控制按钮 */
        .badge-action-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #f5f5f7;
            padding: 3px 8px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            outline: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
        }

        .badge-action-btn:hover {
            background: rgba(255, 255, 255, 0.18);
            border-color: rgba(255, 255, 255, 0.25);
            transform: scale(1.05);
        }

        .badge-action-btn:active {
            transform: scale(0.95);
        }

        /* 弹窗按钮统一样式与微动效 */
        .clicker-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f5f5f7;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            outline: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .clicker-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
        }

        .clicker-btn:active {
            transform: translateY(0) scale(0.97);
        }

        .clicker-btn-save {
            background: linear-gradient(135deg, #007aff, #5856d6);
            border: none;
            color: #fff;
            padding: 8px 20px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            outline: none;
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }

        .clicker-btn-save:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 122, 255, 0.45);
        }

        .clicker-btn-save:active {
            transform: translateY(0) scale(0.97);
        }

        .clicker-btn-reset {
            background: rgba(255, 59, 48, 0.08);
            border: 1px solid rgba(255, 59, 48, 0.2);
            color: #ff453a;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            outline: none;
        }

        .clicker-btn-reset:hover {
            background: rgba(255, 59, 48, 0.15);
            border-color: rgba(255, 59, 48, 0.35);
            transform: translateY(-1px);
        }

        .clicker-btn-reset:active {
            transform: translateY(0) scale(0.97);
        }
    `;
    document.head.appendChild(styleSheet);

    // ==========================================
    // 4. 创建与渲染状态悬浮窗 DOM
    // ==========================================
    const badge = document.createElement('div');
    badge.id = 'antigravity-clicker-badge';

    const dot = document.createElement('div');
    dot.id = 'antigravity-clicker-dot';

    const textSpan = document.createElement('span');
    textSpan.id = 'antigravity-clicker-text';
    textSpan.title = '点击修改参数';

    const infoSpan = document.createElement('span');
    infoSpan.id = 'antigravity-clicker-info';
    Object.assign(infoSpan.style, {
        color: 'rgba(255, 255, 255, 0.4)',
        marginRight: '4px',
        fontSize: '10px',
        fontWeight: 'normal'
    });

    // 手动开启/停止控制按钮
    const divider = document.createElement('div');
    Object.assign(divider.style, {
        width: '1px',
        height: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        margin: '0 4px'
    });

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'antigravity-clicker-toggle';
    toggleBtn.className = 'badge-action-btn';
    toggleBtn.innerText = '⏸️ 停止';

    badge.appendChild(dot);
    badge.appendChild(textSpan);
    badge.appendChild(infoSpan);
    badge.appendChild(divider);
    badge.appendChild(toggleBtn);
    document.body.appendChild(badge);

    // 状态更新机
    function updateBadgeState(state) {
        currentClickerState = state;
        if (state === 'active') {
            dot.style.backgroundColor = '#30d158';
            dot.style.animation = 'clickerPulse 2.2s infinite ease-in-out';
            textSpan.innerText = 'Clicker Active';
            infoSpan.innerText = window.__antigravityClickCount > 0 ? `(${window.__antigravityClickCount} 次)` : '';
            toggleBtn.innerText = '⏸️ 停止';
            toggleBtn.style.color = '#fff';
        } else if (state === 'clicking') {
            dot.style.backgroundColor = '#ff9f0a';
            dot.style.animation = 'none';
            dot.style.boxShadow = '0 0 14px #ff9f0a';
            textSpan.innerText = '重试中...';
            infoSpan.innerText = '';
        } else if (state === 'cooldown') {
            dot.style.backgroundColor = '#8e8e93';
            dot.style.animation = 'none';
            dot.style.boxShadow = 'none';
            textSpan.innerText = '冷却保护';
            infoSpan.innerText = '';
        } else if (state === 'stopped') {
            dot.style.backgroundColor = '#ff3b30';
            dot.style.animation = 'none';
            dot.style.boxShadow = 'none';
            textSpan.innerText = 'Clicker Paused';
            infoSpan.innerText = '';
            toggleBtn.innerText = '▶️ 开启';
            toggleBtn.style.color = '#30d158';
        }

        // 同步更新弹窗中的状态看板（如果弹窗呈开启状态）
        const modalStateDot = document.getElementById('modal-status-dot');
        const modalStateText = document.getElementById('modal-status-text');
        const modalCountText = document.getElementById('modal-count-text');
        
        if (modalStateDot && modalStateText) {
            if (state === 'active') {
                modalStateDot.style.backgroundColor = '#30d158';
                modalStateText.innerText = '监控中';
            } else if (state === 'clicking') {
                modalStateDot.style.backgroundColor = '#ff9f0a';
                modalStateText.innerText = '点击中';
            } else if (state === 'cooldown') {
                modalStateDot.style.backgroundColor = '#8e8e93';
                modalStateText.innerText = '延迟冷却';
            } else if (state === 'stopped') {
                modalStateDot.style.backgroundColor = '#ff3b30';
                modalStateText.innerText = '已手动停止';
            }
        }
        if (modalCountText) {
            modalCountText.innerText = `${window.__antigravityClickCount} 次`;
        }
    }

    updateBadgeState('active');

    // 绑定悬浮章文字/背景区域的点击事件（打开配置弹窗）
    badge.addEventListener('click', (e) => {
        // 如果点击的是手动开启/停止按钮，不打开弹窗
        if (e.target === toggleBtn) return;
        
        e.preventDefault();
        e.stopPropagation();
        showSettingsModal();
    });

    // 绑定手动开启/停止按钮的点击事件
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isPaused = !isPaused;
        
        if (isPaused) {
            updateBadgeState('stopped');
            showToast("🛑 已手动停止自动点击监控");
        } else {
            updateBadgeState('active');
            showToast("▶️ 已重新开启自动点击监控");
            checkAndClickRetry(); // 开启后立即扫描检测一次
        }
    });

    // ==========================================
    // 5. iOS/macOS Premium 毛玻璃设置弹窗
    // ==========================================
    function showSettingsModal() {
        if (document.getElementById('antigravity-clicker-overlay')) return;

        // 遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'antigravity-clicker-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px) saturate(140%)',
            webkitBackdropFilter: 'blur(8px) saturate(140%)',
            zIndex: '9999999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            animation: 'clickerFadeIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards'
        });

        // 弹窗本体
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: 'rgba(28, 28, 30, 0.82)',
            backdropFilter: 'blur(25px) saturate(190%)',
            webkitBackdropFilter: 'blur(25px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            width: '320px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            color: '#f5f5f7',
            animation: 'clickerScaleUp 0.35s cubic-bezier(0.25, 0.8, 0.25, 1.1) forwards',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        });

        // 获取状态颜色
        let statusColor = '#30d158';
        let statusText = '监控中';
        if (isPaused) {
            statusColor = '#ff3b30';
            statusText = '已手动停止';
        } else if (currentClickerState === 'clicking') {
            statusColor = '#ff9f0a';
            statusText = '点击中';
        } else if (currentClickerState === 'cooldown') {
            statusColor = '#8e8e93';
            statusText = '延迟冷却';
        }

        modal.innerHTML = `
            <!-- 头部 -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <h3 style="margin: 0; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    ⚙️ 点击器参数配置
                </h3>
            </div>
            
            <!-- 状态看板 -->
            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div id="modal-status-dot" style="width: 7px; height: 7px; border-radius: 50%; background-color: ${statusColor}; transition: background-color 0.3s;"></div>
                    <span style="color: rgba(255, 255, 255, 0.5);">当前状态:</span>
                    <strong id="modal-status-text" style="color: #f5f5f7;">${statusText}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: rgba(255, 255, 255, 0.5);">累计触发:</span>
                    <strong id="modal-count-text" style="color: #30d158;">${window.__antigravityClickCount} 次</strong>
                </div>
            </div>
            
            <!-- 冷却时间 -->
            <div>
                <label style="display: block; font-size: 11px; color: rgba(255,255,255,0.45); margin-bottom: 6px; font-weight: 500;">
                    重试冷却延迟 (毫秒)
                </label>
                <input type="number" id="clicker-input-cooldown" value="${settings.cooldown}" min="100" max="60000" step="100" 
                    style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); color: #fff; box-sizing: border-box; font-size: 13px; outline: none; transition: all 0.2s;" />
                <div style="font-size: 10px; color: rgba(255, 255, 255, 0.3); margin-top: 4px;">
                    * 匹配特定类特征按钮，点击后进入冷却。默认 3000ms。
                </div>
            </div>
            
            <!-- 按钮组 -->
            <div style="display: flex; gap: 10px; justify-content: space-between; margin-top: 6px;">
                <button id="clicker-btn-reset" class="clicker-btn-reset">
                    恢复默认
                </button>
                <div style="display: flex; gap: 8px;">
                    <button id="clicker-btn-cancel" class="clicker-btn">
                        取消
                    </button>
                    <button id="clicker-btn-save" class="clicker-btn-save">
                        保存并重启
                    </button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 取消动作
        document.getElementById('clicker-btn-cancel').addEventListener('click', () => {
            closeModalWithAnimation(overlay);
        });

        // 遮罩层点击取消
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModalWithAnimation(overlay);
            }
        });

        // 输入框 focus 特效
        const cooldownInput = document.getElementById('clicker-input-cooldown');
        cooldownInput.addEventListener('focus', () => {
            cooldownInput.style.borderColor = 'rgba(0, 122, 255, 0.45)';
            cooldownInput.style.boxShadow = '0 0 8px rgba(0, 122, 255, 0.2)';
            cooldownInput.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        });
        cooldownInput.addEventListener('blur', () => {
            cooldownInput.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            cooldownInput.style.boxShadow = 'none';
            cooldownInput.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        });

        // 恢复默认配置事件
        document.getElementById('clicker-btn-reset').addEventListener('click', () => {
            try {
                localStorage.removeItem('antigravity_clicker_settings');
                closeModalWithAnimation(overlay);
                showToast("🔄 已恢复默认 (3s) 配置！正在重启...");

                setTimeout(() => {
                    if (window.__antigravityStopClicker) {
                        window.__antigravityStopClicker();
                    }
                    if (typeof window.__antigravityClickerLauncher === 'function') {
                        window.__antigravityClickerLauncher();
                    }
                }, 600);
            } catch (e) {
                alert("恢复默认配置失败: " + e);
            }
        });

        // 保存并热重启事件
        document.getElementById('clicker-btn-save').addEventListener('click', () => {
            const cooldownVal = parseInt(cooldownInput.value) || 3000;
            const newSettings = {
                cooldown: Math.max(100, cooldownVal)
            };

            try {
                localStorage.setItem('antigravity_clicker_settings', JSON.stringify(newSettings));
                closeModalWithAnimation(overlay);
                showToast("✨ 参数保存成功！正在重启点击器...");

                setTimeout(() => {
                    if (window.__antigravityStopClicker) {
                        window.__antigravityStopClicker();
                    }
                    if (typeof window.__antigravityClickerLauncher === 'function') {
                        window.__antigravityClickerLauncher();
                    }
                }, 600);

            } catch (e) {
                alert("保存失败: " + e);
            }
        });
    }

    // 优雅的弹窗退出动画
    function closeModalWithAnimation(overlay) {
        overlay.style.transition = 'opacity 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)';
        overlay.style.opacity = '0';
        const modal = overlay.firstElementChild;
        if (modal) {
            modal.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)';
            modal.style.transform = 'scale(0.92) translateY(12px)';
            modal.style.opacity = '0';
        }
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 250);
    }

    // 优雅的 Toast 提示
    function showToast(message) {
        const toast = document.createElement('div');
        Object.assign(toast.style, {
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-24px)',
            backgroundColor: 'rgba(28, 28, 30, 0.9)',
            backdropFilter: 'blur(15px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '12px 24px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: '99999999',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            opacity: '0',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
        toast.innerText = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        }, 40);

        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 350);
        }, 2200);
    }

    // ==========================================
    // 6. 精准类名检测与点击核心逻辑
    // ==========================================

    // 通过 CSS 类名组合，对重试按钮进行像素级精准查找（不解析任何文本，无任何误触发）
    function findRetryButton() {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            const classList = btn.classList;
            
            // 精确匹配具有这几组核心且极具唯一性特征的 Tailwind 类名组合
            if (classList.contains('bg-primary') && 
                classList.contains('text-primary-foreground') && 
                classList.contains('cursor-pointer') && 
                classList.contains('whitespace-nowrap') && 
                classList.contains('text-ellipsis')) {
                return btn;
            }
        }
        return null;
    }

    function checkAndClickRetry() {
        if (isPaused) return; // 如果手动停止，不执行点击
        
        const now = Date.now();
        if (now - lastClicked < COOLDOWN_MS) {
            return;
        }

        const retryBtn = findRetryButton();
        if (retryBtn && retryBtn.offsetWidth > 0 && retryBtn.offsetHeight > 0) {
            triggerClick(retryBtn, "精准类特征匹配重试按钮");
        }
    }

    // 触发点击与状态切换过渡
    function triggerClick(element, sourceName) {
        const now = Date.now();
        const timeString = new Date().toLocaleTimeString();
        console.log(
            `%c⚡ [${timeString}] 检测到 [${sourceName}]，正在自动触发点击...`,
            "color: #ff9f0a; font-weight: bold; padding: 2px 4px; border-left: 3px solid #ff9f0a;"
        );
        
        window.__antigravityClickCount++;
        updateBadgeState('clicking');
        element.click();
        lastClicked = now;
        
        // 动效平滑过渡：重试中(600ms) -> 冷却中(取决于设定值) -> 监控中
        setTimeout(() => {
            if (isPaused) {
                updateBadgeState('stopped');
                return;
            }
            updateBadgeState('cooldown');
            setTimeout(() => {
                if (isPaused) {
                    updateBadgeState('stopped');
                    return;
                }
                updateBadgeState('active');
            }, Math.max(100, COOLDOWN_MS - 600));
        }, 600);
    }

    // 首次检测
    checkAndClickRetry();

    // 启用超低功耗 MutationObserver 监听
    const observer = new MutationObserver(() => checkAndClickRetry());
    observer.observe(document.body, { childList: true, subtree: true });

    // ==========================================
    // 7. 全局挂载与优雅停止接口
    // ==========================================
    window.__antigravityClickerObserver = observer;
    window.__antigravityStopClicker = function() {
        if (window.__antigravityClickerObserver) {
            window.__antigravityClickerObserver.disconnect();
            
            const existingBadge = document.getElementById('antigravity-clicker-badge');
            if (existingBadge && existingBadge.parentNode) {
                existingBadge.parentNode.removeChild(existingBadge);
            }
            const existingStyles = document.getElementById('antigravity-clicker-styles');
            if (existingStyles && existingStyles.parentNode) {
                existingStyles.parentNode.removeChild(existingStyles);
            }
            
            console.log("%c🔴 Antigravity Auto-Clicker 已优雅停止，运行资源已完全释放。", "color: #ff453a; font-weight: bold;");
        }
    };

    // 挂载用于动态重载的 Launcher
    window.__antigravityClickerLauncher = antigravityClicker;
})();
