<template>
    <div class="permissiontable position-re overflow-auto style-scroll" :class="[{'permissiontableMaxheight': from === 'project_rules'},{'permissiontableMaxheightSetting': from === ''}]">
        <table class="table">
            <thead class="position-sti">
                <tr>
                    <th rowspan="2" class="position-sti ActionInSecurity">{{$t('CustomField.action')}}</th>
                    <th v-for="(item, index) in withoutOwnerRoles.filter((x) => x.key !== 2)" :key="index" class="text-center">
                        {{ item.name}}
                    </th>
                </tr>
                <tr>
                    <th v-for="(item, index) in withoutOwnerRoles.filter((x) => x.key !== 2)" :key="index">
                        <div class="read-write-title d-flex justify-content-around">
                            <div v-for="(permission, pIndex) in permissions" :key="index+'sub_heads_none'+pIndex" class="text-center permissionname border-radius-0">{{ $t(`Permissions.${permission.name}`)}}</div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <SecurityPermissionRowCompo
                    v-for="(item, itemIndex) in aiPlanPermission ? filterdRules : filterdRules.filter((x) => x.dependency !== 'artificial_intelligence')"
                    :key="itemIndex"
                    :bIndex="itemIndex"
                    :item="item"
                    :withoutOwnerRoles="withoutOwnerRoles"
                    :permissions="permissions"
                    :advancedPermissionBody="advancedPermissionBody"
                    :changeRule="changeRule"
                    :id="item.name.replaceAll(' ', '_')+item.key"
                    :style="filterdRules[itemIndex+1] && filterdRules[itemIndex+1].isParent ? 'border-bottom: 1px solid #cfcfcf; transition: all 0.3s ease;' : 'transition: all 0.3s ease;' "
                    :planCondition="props.planCondition"
                />
            </tbody>
        </table>
    </div>
</template>

<script setup>
    import SecurityPermissionRowCompo from '@/components/atom/SecurityPermissionRowCompo/SecurityPermissionRowCompo.vue'
    import { computed } from "vue";
    import { useStore } from "vuex";

    const props = defineProps({
        searchValue: {
            type: String,
        },
        withoutOwnerRoles: {
            type: Array,
        },
        advancedPermissionBody: {
            type: Array,
        },
        changeRule : {
            type: Function,
        },
        from : {
            type:String,
            default : ''
        },
        planCondition : {
            type:Boolean,
            default : false
        }
    })
    const { getters } = useStore();
    const permissions = computed(() => {
        return getters["settings/permissions"];
    })
    const aiPlanPermission = computed(() => getters["settings/selectedCompany"].planFeature?.aiPermission);

    const filterdRules = computed(() => {
        let tmp = props.advancedPermissionBody.filter((x) => x.name.toLowerCase().includes(props.searchValue) || x.desc.toLowerCase().includes(props.searchValue));

        tmp.forEach((data) => {
            if(!data.isParent) {
                props.withoutOwnerRoles.forEach((hItem) => {
                    let index = data.roles.findIndex((x) => x.key === hItem.key);

                    if(index > -1) {
                        data.roles[index].disabled = tmp.filter((x) => x.key === data.dependency)[0] ? tmp.filter((x) => x.key === data.dependency)[0].roles.filter((y) => y.key === hItem.key)[0] ? tmp.filter((x) => x.key === data.dependency)[0].roles.filter((y) => y.key === hItem.key)[0].permission === null : false : false
                    }
                })
            }
        })

        return tmp;
    });
</script>

<style src="./style.css"></style>