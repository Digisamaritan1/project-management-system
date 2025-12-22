<template>
    <div class="h-100 w-100">
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="couponsTab">
            <div class="couponsTable--wrapper white-box-main">
                <div class="table_search">
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Search"/>
                    </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                    <button class="company_button" @click="showSidebar = true">+ Add New Coupon</button>
                </div>
                <div class="coupons_Table--wrapper">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Coupon Name</th>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Redemptions</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Halloween</td>
                                <td>5HALLO</td>
                                <td>$ 40 For Forever</td>
                                <td>0 Of Unlimited</td>
                                <td><span class="status active">Active</span></td>
                                <td>
                                    <div class="action_cion">
                                        <button>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.8339 18.0099H2.44127C1.7938 18.0099 1.17286 17.753 0.715031 17.2957C0.257204 16.8384 0 16.2182 0 15.5715V4.1923C0 3.5456 0.257204 2.92538 0.715031 2.4681C1.17286 2.01081 1.7938 1.75391 2.44127 1.75391H8.13756C8.35339 1.75391 8.56037 1.83954 8.71298 1.99197C8.86559 2.1444 8.95132 2.35114 8.95132 2.5667C8.95132 2.78227 8.86559 2.98901 8.71298 3.14144C8.56037 3.29387 8.35339 3.3795 8.13756 3.3795H2.44127C2.22545 3.3795 2.01847 3.46514 1.86586 3.61757C1.71325 3.77 1.62751 3.97673 1.62751 4.1923V15.5715C1.62751 15.7871 1.71325 15.9938 1.86586 16.1462C2.01847 16.2986 2.22545 16.3843 2.44127 16.3843H13.8339C14.0497 16.3843 14.2567 16.2986 14.4093 16.1462C14.5619 15.9938 14.6476 15.7871 14.6476 15.5715V9.88189C14.6476 9.66632 14.7334 9.45959 14.886 9.30716C15.0386 9.15473 15.2456 9.06909 15.4614 9.06909C15.6772 9.06909 15.8842 9.15473 16.0368 9.30716C16.1894 9.45959 16.2751 9.66632 16.2751 9.88189V15.5715C16.2751 16.2182 16.0179 16.8384 15.5601 17.2957C15.1023 17.753 14.4813 18.0099 13.8339 18.0099Z" fill="#7A7A8C"/>
                                                <path d="M5.6964 13.133C5.5893 13.1336 5.48314 13.1131 5.38399 13.0726C5.28484 13.0322 5.19467 12.9726 5.11863 12.8973C5.01262 12.7939 4.93688 12.6635 4.8996 12.5203C4.86231 12.377 4.86489 12.2264 4.90705 12.0845L5.72081 8.83328C5.75514 8.68905 5.8283 8.55695 5.93239 8.45126L13.6631 0.729676C14.1475 0.2676 14.7916 0.00976563 15.4615 0.00976562C16.1313 0.00976563 16.7754 0.2676 17.2599 0.729676C17.734 1.20761 17.9999 1.85318 17.9999 2.52596C17.9999 3.19875 17.734 3.84432 17.2599 4.32225L9.52919 12.0438C9.42338 12.1478 9.29112 12.2209 9.14672 12.2552L5.8917 13.068C5.82962 13.0978 5.76399 13.1197 5.6964 13.133ZM7.24253 9.48352L6.81124 11.2067L8.53641 10.7759L16.1043 3.20871C16.1895 3.12479 16.2571 3.02481 16.3032 2.91458C16.3493 2.80435 16.3731 2.68607 16.3731 2.5666C16.3731 2.44713 16.3493 2.32885 16.3032 2.21862C16.2571 2.10839 16.1895 2.00842 16.1043 1.92449C15.9325 1.75669 15.7018 1.66274 15.4615 1.66274C15.2212 1.66274 14.9904 1.75669 14.8186 1.92449L7.24253 9.48352Z" fill="#7A7A8C"/>
                                            </svg>
                                        </button>
                                        <button>
                                            <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.5455 3.28249H12.2727V2.46431C12.2727 1.81333 12.0141 1.189 11.5538 0.728685C11.0935 0.268369 10.4692 0.00976563 9.81818 0.00976562H6.54545C5.89447 0.00976563 5.27015 0.268369 4.80983 0.728685C4.34951 1.189 4.09091 1.81333 4.09091 2.46431V3.28249H0.818182C0.601187 3.28249 0.393079 3.36869 0.23964 3.52213C0.086201 3.67557 0 3.88368 0 4.10067C0 4.31767 0.086201 4.52578 0.23964 4.67922C0.393079 4.83266 0.601187 4.91886 0.818182 4.91886H1.63636V15.5552C1.63636 16.2062 1.89497 16.8305 2.35528 17.2908C2.8156 17.7512 3.43992 18.0098 4.09091 18.0098H12.2727C12.9237 18.0098 13.548 17.7512 14.0084 17.2908C14.4687 16.8305 14.7273 16.2062 14.7273 15.5552V4.91886H15.5455C15.7625 4.91886 15.9706 4.83266 16.124 4.67922C16.2774 4.52578 16.3636 4.31767 16.3636 4.10067C16.3636 3.88368 16.2774 3.67557 16.124 3.52213C15.9706 3.36869 15.7625 3.28249 15.5455 3.28249ZM5.72727 2.46431C5.72727 2.24732 5.81347 2.03921 5.96691 1.88577C6.12035 1.73233 6.32846 1.64613 6.54545 1.64613H9.81818C10.0352 1.64613 10.2433 1.73233 10.3967 1.88577C10.5502 2.03921 10.6364 2.24732 10.6364 2.46431V3.28249H5.72727V2.46431ZM13.0909 15.5552C13.0909 15.7722 13.0047 15.9803 12.8513 16.1338C12.6978 16.2872 12.4897 16.3734 12.2727 16.3734H4.09091C3.87391 16.3734 3.66581 16.2872 3.51237 16.1338C3.35893 15.9803 3.27273 15.7722 3.27273 15.5552V4.91886H13.0909V15.5552ZM7.36364 8.19158V13.1007C7.36364 13.3177 7.27744 13.5258 7.124 13.6792C6.97056 13.8327 6.76245 13.9189 6.54545 13.9189C6.32846 13.9189 6.12035 13.8327 5.96691 13.6792C5.81347 13.5258 5.72727 13.3177 5.72727 13.1007V8.19158C5.72727 7.97459 5.81347 7.76648 5.96691 7.61304C6.12035 7.4596 6.32846 7.3734 6.54545 7.3734C6.76245 7.3734 6.97056 7.4596 7.124 7.61304C7.27744 7.76648 7.36364 7.97459 7.36364 8.19158ZM10.6364 8.19158V13.1007C10.6364 13.3177 10.5502 13.5258 10.3967 13.6792C10.2433 13.8327 10.0352 13.9189 9.81818 13.9189C9.60119 13.9189 9.39308 13.8327 9.23964 13.6792C9.0862 13.5258 9 13.3177 9 13.1007V8.19158C9 7.97459 9.0862 7.76648 9.23964 7.61304C9.39308 7.4596 9.60119 7.3734 9.81818 7.3734C10.0352 7.3734 10.2433 7.4596 10.3967 7.61304C10.5502 7.76648 10.6364 7.97459 10.6364 8.19158Z" fill="#7A7A8C"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Halloween</td>
                                <td>5HALLO</td>
                                <td>$ 40 For Forever</td>
                                <td>0 Of Unlimited</td>
                                <td><span class="status Expired">Expired</span></td>
                                <td>
                                    <div class="action_cion">
                                        <button>
                                            <img src="@/assets/images/svg/edit_icon.svg" alt=""/>
                                        </button>
                                        <button>
                                            <img src="@/assets/images/svg/delete_icon.svg" alt=""/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                 </div>
                <div class="pagination-table">
                    <ul>                                                                    
                        <li><img src="@/assets/images/svg/right_arrow.svg" alt=""/></li>
                        <li class="active">1</li>
                        <li>2</li>
                        <li>3</li>
                        <li><img src="@/assets/images/svg/left_arrow.svg" alt=""/></li>
                    </ul>
                </div>
            </div>
        </div>

        <Sidebar
            v-model:visible="showSidebar"
            title="Add New Coupon"
            width="50%"
        >
            <template #head-right>
                <div class="d-flex sidebar-header--btn">
                    <button class="close-sidebar btn">
                        Close
                    </button>
                    <button class="save-sidebar btn">
                        Save
                    </button>
                </div>
            </template>
            <template #body>
                <div class="p-15px">
                    <div class="create-coupon-area white-box-main mb-20">
                        <h4>Create Coupon</h4>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="coupon_name">Coupon Name</label>
                                    <input type="text" class="form-control" id="coupon_name" placeholder="Enter Coupon Name">
                                </div>
                                <span>A descriptive name for this coupon. Please note that this will be displayed to customers, in case "Invoice Name" field is not provided.</span>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="coupon_code">Code<span>*</span></label>
                                    <div class="generate-btn">
                                        <input type="text" class="form-control" id="coupon_code" placeholder="Enter Coupon Code">
                                        <button class="btn btn-generate"><img src="@/assets/images/png/btngenerate.png"/> Generate</button>
                                    </div>
                                </div>
                                <span>This will be the reference used by AlianHub API to identify this coupon.</span>
                            </div>
                        </div>
                    </div>
                    <div class="create-coupon-area white-box-main mb-20">
                        <h4>Discount</h4>
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="coupon_name">Discount*</label>
                                    <input type="text" class="form-control" id="coupon_name" placeholder="Percentage">
                                </div>
                                <span>The specified percentage will be deducted.</span>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <!-- <label for="coupon_code">Code<span>*</span></label> -->
                                    <div class="generate-btn btn-percentage">
                                        <input type="text" class="form-control" id="coupon_code" placeholder="">
                                        <button class="btn btn-percentage"><img src="@/assets/images/png/percentageimg.png"/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="create-coupon-area white-box-main mb-20">
                        <h4>Duration</h4>
                        <div class="row align-items-center">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="coupon_name">Duration Type*</label>
                                </div>
                                <span class="duration_text">How long should this coupon be applied to the subscription?</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="d-flex mt-10px">
                                    <input type="radio" class="mr-10px radio" name="radio-group-user-role"
                                        id="userRoleYes" >
                                    <label for="userRoleYes" class="createPlan_label">One Time</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex mt-10px">
                                    <input type="radio" class="mr-10px radio" name="radio-group-user-role"
                                        id="userRoleNo">
                                    <label for="userRoleNo" class="createPlan_label">Forever</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex mt-10px">
                                    <input type="radio" class="mr-10px radio" name="radio-group-user-role"
                                        id="userRoleNoyes">
                                    <label for="userRoleNoyes" class="createPlan_label">Limited Period</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="create-coupon-area white-box-main mb-20">
                        <h4>Validity</h4>
                        <div class="row d-flex">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="coupon_name">Valid Till</label>
                                    <input type="date" class="form-control" id="coupon_name" placeholder="">
                                </div>
                                <span>Date (along with time) upto which the coupon can be applied to new subscriptions.</span>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="coupon_code">Maximum Redemptions</label>
                                    <input type="text" class="form-control" id="coupon_code" placeholder="">
                                </div>
                                <span>Maximum number of times this coupon can be redeemed.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Sidebar>
    </div>
</template>
<script setup>
// PACKAGES
import { ref } from "vue";

// COMPONENTS
import BreadCrumb from "@/components/atom/BreadCrumb/BreadCrumb.vue"
import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"

const breadCrumbArray = [
    {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
    {name: 'Coupons', routeObj: {name: 'Coupons'}, isClickable: false},
]

const showSidebar = ref(false)
</script>
<style scoped src="./style.css"></style>