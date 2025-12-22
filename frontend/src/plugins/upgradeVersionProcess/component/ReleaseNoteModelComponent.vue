<template>
    <div class="release-note-section">
        <div class="position-re spinner-box" v-if="loading">
            <SpinnerComp :is-spinner="loading" />
        </div>
        <div class="version-main-section" v-if="!loading && !errorMessage">
            <div class="pr-2 pl-2 pt-5 pb-5 text-center color-green" v-if="infoMessage">
                <h1>{{ infoMessage }}</h1>
            </div>
            <div v-else>
                <span v-if="fromWhich === ''" class="font-size-36 font-weight-700 line-height-48_8 blue">{{$t('Upgrades.are_you_sure_you_want_to_update')}}</span>
            </div>
            <div class="version-section" v-if="versionUpdate?.finalVersionObj?.releaseNotes?.notes?.length">
                <div class="new-version-main">
                    <div class="new-version-box">
                        <p class="m-0 black font-size-22 font-weight-700 line-height-33">{{$t('Upgrades.whats_new')}}{{versionUpdate.finalVersionObj.version}}</p>
                        <p class="m-0 black font-size-16 font-weight-400 line-height-24">{{$t('Upgrades.find_out_whats_included_in_this_update')}}</p>
                    </div>
                </div>
                <div class="new-version-body style-scroll-2-px">
                    <div>
                        <p class="m-0 mb-15px black font-size-22 font-weight-700 line-height-33">{{$t('Upgrades.please_see_below_for_a_list_of_changes_to_the_features')}}</p>
                        <div v-for="(raw, index) in versionUpdate?.finalVersionObj?.releaseNotes?.notes" v-bind:key="index">
                            <p class="m-0 mb-10px mt-5px black font-size-16 font-weight-500 line-height-24">{{$t('Upgrades.improved_performance')}} (v{{ raw.title }})</p>
                            <span v-html="raw.description"></span>
                        </div>
                    </div>
                    <div v-if="versionUpdate?.finalVersionObj?.releaseNotes?.newIntegrations?.length">
                        <p class="m-0 mt-20px mb-20px black font-size-22 font-weight-700 line-height-33">{{$t('Upgrades.to_integrate_new_services_into_an_alian_hub')}}</p>
                        <div v-for="(raw, index) in versionUpdate?.finalVersionObj?.releaseNotes?.newIntegrations" v-bind:key="index">
                            <span v-if="raw.title" v-html="raw.title"></span>
                            <span v-if="raw.description" v-html="raw.description"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!loading && errorMessage">
            <div class="pr-2 pl-2 pt-5 pb-5 text-center color-red">
                <h1>{{ errorMessage }}</h1>
            </div>
        </div>
    </div>
</template>
<script setup>
    import {
        defineProps,
    } from "vue";
    import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue";

    defineProps({
        openReleaseNoteModel: {
            type: Boolean
        },
        loading: {
            type: Boolean
        },
        errorMessage: {
            type: String
        },
        infoMessage: {
            type: String
        },
        versionUpdate: {
            type: Object
        },
        fromWhich: {
            type: String,
            default: ''
        }
    });
</script>