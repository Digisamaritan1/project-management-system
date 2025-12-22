import { apiRequest } from "@/services";
// import { dbCollections } from "@/utils/collections";
// import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
import * as env from '@/config/env';
export const setChargeBeePrice = ({ commit }) => {
    return new Promise((resolve, reject) => {
      try {
        let query = [{$sort:{sortIndex: 1}}];
        apiRequest("post", `${env.SUBSCRIPTIONPLAN}/find`, {query : query})
          .then((res) => {
            commit("setChargeBeePrice", res.data);
            resolve(res);
          })
          .catch((err) => {
            console.error("Error fetching Subscription Plans:", err);
            reject(err);
          });
      } catch (error) {
        console.error("Error fetching Subscription Plans:", error);
        reject(error);
      }
    });
  };


export const setplanFeatureDisplay =({commit}) => {
    return new Promise ((resolve,reject) =>{
        try{
            apiRequest("get", env.PLANFEATUREDISPLAY).then((res)=>{
                if(res.status !== 200) {
                    throw new Error('Failed to fetch plan features')
                }
                commit("setplanFeatureDisplay",res.data);
                resolve(res.data);
            }).catch((error)=>{
                console.error("Error GET SUBSCRIPRION PLAN",error)
                reject(error)
            })
        } catch(error) {
            reject(error)
        }
    })  
}


export const setplanFeature =({commit}) => {
    return new Promise ((resolve,reject) =>{
        try{
            apiRequest("get", env.PLANFEATURE).then((res)=>{
                if(res.status !== 200) {
                    throw new Error('Failed to fetch plan features')
                }
                commit("setplanFeature",res.data);
                resolve(res.data);
            }).catch((error)=>{
                console.error("Error GET SUBSCRIPRION PLAN",error)
                reject(error)
            })
        } catch(error) {
            reject(error)
        }
    })  
}