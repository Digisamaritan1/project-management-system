import React, { useState, useEffect } from 'react';
import { getUserImage } from '../../controller/user/user';
import { useSelector } from 'react-redux';
import { apiRequest } from '../../utils/services';

const WasabiImage = ({ url = "",isUser,className="" }) => {
    const [image, setImage] = useState('/images/png/default_user.png');
    const currentCopany = useSelector((state) => state.company.currentCompany);
    useEffect(() => {
        
        if (url !== "") {
            if (url.includes("http")) {
                setImage(url);
            } else {
                if(isUser){
                    getUserImage({ path: url })
                    .then(res => {
                        if (res.status) {
                            setImage(res.statusText);
                        } else {
                            setImage('images/png/default_user.png');
                        }
                    });
                } else {
                    apiRequest("post",'/api/v1/wasabi/retriveObject',{
                        companyId: currentCopany?._id,
                        path: url
                    }).then((res)=>{
                        setImage(res.data.statusText);
                    }).catch((error) => {
                        console.error(error);
                    })
                }
            }
        }
    }, [url]);

    return (
        <img 
            src={image} 
            className={`object-cover ${className}`}
            alt="User Profile"
            onError={() => isUser ? setImage('/images/png/default_user.png') : setImage('https://firebasestorage.googleapis.com/v0/b/erpproject-1addc.appspot.com/o/defaut_task_status_img.png?alt=media&token=570a9fca-e23a-41ee-a47b-d82fb766b1fd')}
        />
    );
};

export default WasabiImage; 