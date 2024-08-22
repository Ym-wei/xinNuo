/*
 * @Author: zhongzhixin
 * @Date: 2023-03-22 15:01:13
 * @LastEditors: zhongzhixin
 * @LastEditTime: 2023-03-22 15:27:01
 */
import { showToast, showDialog, showNotify, showImagePreview } from 'vant'
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import 'vant/es/notify/style'
import 'vant/es/image-preview/style'

export const Toast = title => showToast(title)
export const Notify = ({ type = 'primary', message }) => {
  showNotify({
    type,
    message
  })
}
export const Dialog = (Option = {}) => showDialog({ ...Option })
export const ImagePreview = (Option = {}) => showImagePreview({ ...Option })
