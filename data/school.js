/* data/school.js */
// 学校相关
module.exports = {
  // 学校官方小程序AppID
  AppID: "wxdebeb8c89ecb52df",

  // 学校信息
  school_information: {
    // 学校全称
    school_name_full: "珠海科技学院",
    // 学校英文名
    school_name_English_full: "ZHUHAI COLLEGE OF SCIENCE AND TECHNOLOGY",
    // 校规校训
    motto: "爱国·勤奋·和谐·创新",
    // 学校荣誉
    honor: "中国民办高校排名第二",
    // 建校时间
    build_time: 2004,
    // 办校类型
    school_type: "民办",
    // 院校类型
    institution_type: "综合类",
    // 学校所在地
    location: "广东珠海・金湾",
    // 学校简介
    text: "珠海科技学院（原吉林大学珠海学院）成立于2004年5月18日，2011年获批学士学位授予单位，先后与吉林大学、华南师范大学、吉林化工学院开展联合培养硕士研究生合作，2021年获批广东省硕士学位授予立项建设单位。建校20年来共为社会输送10万余名本科生，自2014年以来共招收联合培养硕士研究生301名，已发展成为全国有影响力、办学特色鲜明的民办本科高校。"
  },

  // 校园指南
  school_guide: [{
      title: '珠科校园导航',
      content: '本小程序通过调用腾讯地图api实现导航，但因我本身对校园有些地方不太了解，所以有的地方并没有标记出来，存在许多问题，请见谅！',
      keywords: ['介绍']
    }, {
      title: '作息时间表',
      content: '仅供参考，以实时文件为准',
      imageList: ['/images/views/zuo-xi.png'],
      keywords: ['上课时间表']
    }, {
      title: '图书馆阅览室',
      content: '图书馆开放时间表\n仅供参考，具体以实时文件为准',
      imageList: ['/images/views/tu-shu-guan-time.png'],
      keywords: []
    },
    {
      title: '快递',
      content: '营业时间：8:30 - 19:00 \n收发地址：广东省珠海市金湾区珠海科技学院\n\n校内快递点：圆通 | 申通 | 京东 | 中通 | 韵达 \n快递站均在南2门对出来，位置醒目。\n\n校外快递点：顺丰快递\n从南1门出去右转直走即可见到。',
      imageList: ['/images/views/kuai-di-time.png'],
      keywords: ['菜鸟驿站']
    },
    {
      title: '教务处',
      content: '地址：在图书馆内部\n服务时间：周一至周五（法定节假日除外）\n上午8:30 - 11:30\n下午14:30 - 16:30\n时间仅供参考\n\n相关网址:https://jx.zcst.edu.cn/',
      imageList: [],
      keywords: ['行政']
    },
    {
      title: '警务与保卫',
      content: '电话：0756-7626119 0756-7629815\n地点：南1门右侧',
      keywords: ['保卫处', '保安']
    },
    {
      title: '门禁',
      content: '早六点，晚十一点半',
      imageList: [],
      keywords: ['关门时间']
    },
    {
      title: '宿舍供暖',
      content: '无供暖，但有空调。\n也可自行购置取暖设备，但注意用电安全。',
      imageList: [],
      keywords: ['暖气']
    },
    {
      title: '饮用水',
      content: '宿舍楼各房间均配备有饮水机。\n饮用水价格：8元/桶（目前），自行去竹6购买水票抬水上宿舍',
      imageList: ['https://cdnjson.com/images/2024/02/26/Water_dispensereffee25621ed10b9.png'],
      keywords: []
    },
    {
      title: '自动售货机',
      content: '宿舍楼下配备有自动售货机，扫码支付即可购买商品。',
      imageList: ['https://cdnjson.com/images/2024/02/26/Vending_Machine60fd713c293f5e70.png'],
      keywords: []
    },
    {
      title: '报修',
      content: '①教室报修：\n电话：拨打教室讲台上的指定报修电话。\n\n②宿舍报修：\n登记：在我的珠科app上即登记或者自行找宿管阿姨',
      imageList: ['https://cdnjson.com/images/2024/02/26/repairc22c2a9ad8eea3f5.png'],
      keywords: ['修理']
    }
  ]
}