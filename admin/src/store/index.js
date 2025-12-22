import { createStore } from 'vuex'

import planTab from './plan'
import companyTab from './company'
import brandSettingTab from './brandSettings'
export default createStore({
    modules: {
        planTab,
        companyTab,
        brandSettingTab
    }
})
