const imagesByRegionGroup = {
    Uganda: {
        src: `/assets/uganda_outline.png`,
        alt: 'Uganda outline',
        href: `${process.env.ROOT_PATH}/map?zoom=7&lng=32.37&lat=1.313`,
    },
    Ethiopia: {
        src: `/assets/ethiopia_outline.png`,
        alt: 'Ethiopia outline',
        href: `${process.env.ROOT_PATH}/map?zoom=5.82&lng=40.25&lat=8.83`,
    },
    Tanzania: {
        src: `/assets/tanzania_outline.png`,
        alt: 'Tanzania outline',
        href: `${process.env.ROOT_PATH}/map?zoom=6.20&lng=34.55&lat=-6.40`,
    },
};

export default imagesByRegionGroup;