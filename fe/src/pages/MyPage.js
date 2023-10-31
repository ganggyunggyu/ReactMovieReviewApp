/** @format */

import React, { useEffect, useState } from 'react';
import axiosConfig from '../api/axiosConfig';
import { userInfoState } from '../recoilAtoms';
import { useRecoilValue } from 'recoil';
import { useRecoilState } from 'recoil';

import CardReview from '../components/CardReview';
import { useNavigate } from 'react-router-dom';
import { reviewsState } from '../recoilAtoms';

export default function MyPage() {
  const navigator = useNavigate();
  const userInfo = useRecoilValue(userInfoState);
  const [reviews, setReviews] = useRecoilState(reviewsState);
  const [myReviews, setMyReviews] = useState([]);
  const fetchReview = async () => {
    const result = await axiosConfig.post(
      `post/myreview`,
      {
        userId: userInfo._id,
      },
      { withCredentials: true }
    );
    setReviews(result.data.reviews);
  };

  useEffect(() => {
    fetchReview();
  }, []);

  return (
    <div className=''>
      <div className='flex flex-col items-center justify-center p-10'>
        <p>나 {userInfo.displayName}이 쓴 리뷰들</p>
        <div className='flex w-11/12 overflow-x-scroll gap-3 p-3'>
          {reviews.map((review, i) => {
            return (
              <CardReview
                key={i}
                content={review}
                onClick={() => {
                  navigator(`/detail/review/${review.userId}/${review._id}`);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}