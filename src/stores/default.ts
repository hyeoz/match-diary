import { create } from 'zustand';

const useBottomTabState = create<{ isOpen: boolean; update: () => void }>(
  set => ({
    isOpen: false,
    update: () => set(prev => ({ isOpen: !prev.isOpen })),
  }),
);

const useTabHistory = create<{
  history: string[];
  accumulate: (key: string) => void;
}>(set => ({
  history: [],
  accumulate: key => set(prev => ({ history: [...prev.history, key] })),
}));

const useCarouselIndexState = create<{
  carouselIndexState: number;
  setCarouselIndexState: (index: number) => void;
}>(set => ({
  carouselIndexState: 0,
  setCarouselIndexState: (index: number) =>
    set(() => ({ carouselIndexState: index })),
}));

// NOTE 기록 및 경기에 대한 정보는 api 호출로 대체하고, 필요한 경우 추가

export { useBottomTabState, useTabHistory, useCarouselIndexState };
