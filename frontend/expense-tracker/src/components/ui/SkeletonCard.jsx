import React from "react";
import Skeleton from "./Skeleton";

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="card-surface p-6 space-y-4 animate-fade-in">
    <Skeleton className="h-5 w-1/3" />
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
    <Skeleton className="h-10 w-2/3 mt-2" />
  </div>
);

export const SkeletonStatCard = () => (
  <div className="bg-white rounded-3xl p-6 shadow-lg flex items-center gap-5 min-w-[280px] animate-fade-in-up">
    <Skeleton className="w-12 h-12 rounded-2xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-32" />
    </div>
  </div>
);

export const SkeletonTxList = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-2xl animate-fade-in-up"
        style={{ animationDelay: `${i * 60}ms` }}
      >
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ height = 320 }) => (
  <div className="w-full animate-fade-in" style={{ height }}>
    <div className="h-full flex items-end justify-around gap-2 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-full rounded-t-lg"
          style={{
            height: `${30 + ((i * 37) % 65)}%`,
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  </div>
);
