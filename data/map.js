/* data/map.js */
// 地图相关
module.exports = {
  // 地图部分参数

  // 腾讯位置服务API
  mapKey: "M5MBZ-WOVC5-3NGIA-IK6AZ-VIBQ2-77FB5",

  // 学校精确坐标（用于地图定位和获取天气数据）
  longitude: 113.405869,
  latitude: 22.052092,

  // 是否展示 POI 点
  enablepoi: true,
  // 是否显示带有方向的当前定位点
  showLocation: true,
  // 缩放级别
  scale: 14.9,
  // 最小缩放级别，比缩放级别小0.3-0.4为宜
  minscale: 14.7,

  // // 自定义图层
  // groundoverlay: {
  //   // 图层透明度 0-1，对应 0%-100%
  //   opacity: 0.8,
  //   // 西南角
  //   southwest_latitude: 25.088910,
  //   southwest_longitude: 110.273850,
  //   // 东北角
  //   northeast_latitude: 25.098995,
  //   northeast_longitude: 110.281229
  // },

  // 地图边界
  boundary: {
    // 西南角
    southwest_latitude: 22.039005,
    southwest_longitude: 113.396259,
    // 东北角
    northeast_latitude: 22.065179,
    northeast_longitude: 113.415480
  },

  // 学校边界
  school_boundary: {
    // 东（学校最东端点的 经度）
    east: 113.414177,
    // 西（学校最西端点的 经度）
    west: 113.396439,
    // 南（学校最南端点的 纬度）
    south: 22.040034,
    // 北（学校最北端点的 纬度）
    north: 22.061406,
  },

  // 闭合多边形
  points: [],

  // 默认地点
  default_point: {
    name: "东门",
    aliases: "学校正大门",
    desc: "学校正大门\n可以通行行人和车辆",
    latitude: 22.047331,
    longitude: 113.407262
  },

  // 地点数据（使用嵌套列表存储）
  site_data: [{
      id: 1,
      name: "楼宇",
      list: [{
          id: 1,
          name: "明德楼",
          aliases: "第一教学楼",
          img: "/images/views/yi-jiao.png",
          desc: "以小教室为主的课室\n小班课基本都在这上",
          latitude: 22.049449,
          longitude: 113.404561
        },
        {
          id: 2,
          name: "至善楼",
          aliases: "第三教学楼",
          img: "/images/views/san-jiao.png",
          desc: "不考四六级永远不会去的教学楼",
          latitude: 22.049843,
          longitude: 113.406206
        },
        {
          id: 3,
          name: "博文楼",
          aliases: "第二教学楼",
          img: "/images/views/er-jiao.png",
          desc: "大部分用来上大教室课的教学楼",
          latitude: 22.052087,
          longitude: 113.404863
        },
        {
          id: 4,
          name: "敏学楼",
          aliases: "实验楼",
          img: "/images/views/shi-yan.png",
          desc: "拥有最多由电子垃圾组成的机房",
          latitude: 22.054402,
          longitude: 113.407253
        },
        {
          id: 5,
          name: "怀德楼",
          aliases: "机电实验楼",
          img: "/images/views/ji-dian.png",
          desc: "用来做机电实验的实验楼",
          latitude: 22.055798,
          longitude: 113.404949
        },
        {
          id: 6,
          name: "国学院",
          aliases: "国学院",
          img: "/images/views/guo-xue.png",
          desc: "高数梦开始的地方",
          latitude: 22.048209,
          longitude: 113.398214
        },
        {
          id: 7,
          name: "雅韵楼",
          aliases: "音乐舞蹈学院",
          img: "/images/views/ya-yun.png",
          desc: "印象中只在大一开会去过",
          latitude: 22.042014,
          longitude: 113.401110
        },
        {
          id: 8,
          name: "综合楼",
          aliases: "继续教育学院",
          img: "/images/views/zong-he.png",
          desc: "专升本教学楼",
          latitude: 22.042490,
          longitude: 113.397904
        }
      ]
    },
    {
      id: 2,
      name: "图书馆",
      list: [{
          id: 1,
          name: "图书馆行政区南区",
          aliases: "成绩单自助打印，教务处，网络中心",
          img: "/images/views/tu-shu-guan01.png",
          desc: "只去过那里改过图书馆网站密码",
          latitude: 22.051053,
          longitude: 113.406539
        },
        {
          id: 2,
          name: "图书馆行政区北区",
          aliases: "保卫处，学生处",
          img: "/images/views/tu-shu-guan02.png",
          desc: "不是特别了解",
          latitude: 22.052269,
          longitude: 113.407500
        },
        {
          id: 3,
          name: "图书馆借还区",
          aliases: "号称亚洲最大图书馆",
          img: "/images/views/tu-shu-guan03.png",
          desc: "一楼有人工或者自助的借还服务\n二楼及以上都是自习区与图书区",
          latitude: 22.051764,
          longitude: 113.406884
        }
      ]
    },
    {
      id: 3,
      name: "二级学院",
      list: [{
          id: 1,
          name: "继续教育学院",
          aliases: "",
          img: "/images/views/zong-he.png",
          desc: "位于综合楼",
          latitude: 22.042495,
          longitude: 113.397890
        },
        {
          id: 2,
          name: "音乐舞蹈学院",
          img: "/images/views/ya-yun.png",
          aliases: "",
          desc: "位于雅韵楼",
          latitude: 22.042024,
          longitude: 113.401093
        },
        {
          id: 3,
          name: "建筑与城乡规划学院",
          aliases: "",
          img: "/images/views/cheng-xiang.png",
          desc: "位于至善楼",
          latitude: 22.049256,
          longitude: 113.405538
        },
        {
          id: 4,
          name: "健康学院",
          aliases: "",
          img: "/images/views/jian-kang.png",
          desc: "位于博文楼",
          latitude: 22.051566,
          longitude: 113.405064
        },
        {
          id: 5,
          name: "机电工程学院",
          aliases: "",
          img: "/images/views/ji-dian-.png",
          desc: "位于怀德楼",
          latitude: 22.055585,
          longitude: 113.405060
        }
      ]
    },
    {
      id: 4,
      name: "校门",
      list: [{
          id: 1,
          name: "西南门",
          aliases: "学校侧门",
          img: "/images/views/nan-men.png",
          desc: "学校侧门\n连接校外小食街重要通道",
          latitude: 22.042214,
          longitude: 113.397145
        },
        {
          id: 2,
          name: "南2门",
          aliases: "学校侧门",
          img: "/images/views/nan-men-.png",
          desc: "学校侧门\n连接校内的快递站",
          latitude: 22.041351,
          longitude: 113.399761
        },
        {
          id: 3,
          name: "东门",
          aliases: "学校大门",
          img: "/images/views/dong-men.png",
          desc: "学校大门\n车辆主要进出通道",
          latitude: 22.047348,
          longitude: 113.407255
        }
      ]
    },
    {
      id: 5,
      name: "体育场馆",
      list: [{
          id: 1,
          name: "高尔夫球场",
          aliases: "专打高尔夫的场地",
          img: "/images/views/gao-er-fu.png",
          desc: "打高尔夫的好去处",
          latitude: 22.043105,
          longitude: 113.403770
        },
        {
          id: 2,
          name: "网球场",
          aliases: "专打网球的场地",
          img: "/images/views/wu-huan-.png",
          desc: "打网球的好去处",
          latitude: 22.043454,
          longitude: 113.401710
        },
        {
          id: 3,
          name: "排球场",
          aliases: "专打排球的场地",
          img: "/images/views/wu-huan-.png",
          desc: "学生打排球的好去处",
          latitude: 22.043942,
          longitude: 113.402014
        },
        {
          id: 4,
          name: "游泳馆",
          aliases: "专门游泳的场地",
          img: "/images/views/you-yong.png",
          desc: "学生游泳的好去处",
          latitude: 22.044934,
          longitude: 113.398279
        },
        {
          id: 5,
          name: "田径场",
          aliases: "风雨足球场",
          img: "/images/views/cao-chang.png",
          desc: "校内最大的田径场\n学校经常在这举办活动",
          latitude: 22.046140,
          longitude: 113.397477
        },
        {
          id: 6,
          name: "五环体育馆",
          aliases: "校内唯一的室内体育馆",
          img: "/images/views/wu-huan.png",
          desc: "许多小型的比赛经常在这举办！",
          latitude: 22.043767,
          longitude: 113.402508
        }
      ]
    },
    {
      id: 6,
      name: "美食",
      list: [{
          id: 1,
          name: "旧饭堂",
          aliases: "食堂",
          img: "/images/views/jiu-fan.png",
          desc: "校内最大的饭堂\n选择也是最多的",
          latitude: 22.045997,
          longitude: 113.399693
        },
        {
          id: 2,
          name: "新饭堂",
          aliases: "食堂",
          img: "/images/views/xin-fan.png",
          desc: "规模相对于旧饭堂较小\n大多数都是在星期四吃KFC",
          latitude: 22.057860,
          longitude: 113.408209
        }
      ]
    },
    {
      id: 7,
      name: "学生服务",
      list: [{
          id: 1,
          name: "卫生所",
          aliases: "唯一的医务室",
          img: "/images/views/yi-yuan.png",
          desc: "记得戴口罩哦，如果去医院记得弄清报销材料和流程",
          latitude: 22.047124,
          longitude: 113.399867
        },
        {
          id: 4,
          name: "水票售卖处",
          aliases: "专门购买水票的地方",
          img: "/images/views/shui-piao.png",
          desc: "竹6一楼\n水票购买",
          latitude: 22.043070,
          longitude: 113.399129
        }
      ]
    },
    {
      id: 8,
      name: "生活服务",
      list: [{
          id: 1,
          name: "校内快递点",
          aliases: "校内唯一的快递站",
          img: "/images/views/kuai-di-zhan.png",
          desc: "圆通 | 申通 | 京东 | 中通 | 韵达",
          latitude: 22.041873,
          longitude: 113.400379
        },
        {
          id: 2,
          name: "盛客超市",
          aliases: "超市",
          img: "/images/views/chao-shi.png",
          desc: "食堂旁一家平凡的超市，学生一般都去那里买东西",
          latitude: 22.045808,
          longitude: 113.399407
        },
        {
          id: 4,
          name: "眼镜店",
          aliases: "眼镜店",
          img: "/images/views/yan-jing.png",
          desc: "校内唯一一家眼镜店",
          latitude: 22.042328,
          longitude: 113.397470
        }
      ]
    },
    {
      id: 9,
      name: "宿舍公寓",
      list: [{
          id: 1,
          name: "竹园",
          aliases: "竹园",
          img: "/images/views/zhu-yuan.png",
          desc: "地理位置最好的宿舍\n除了离教学楼哪里都近",
          latitude: 22.043579,
          longitude: 113.399251
        },
        {
          id: 2,
          name: "康园",
          aliases: "康园",
          img: "/images/views/kang-yuan.png",
          desc: "离饭堂最近的宿舍楼",
          latitude: 22.044943,
          longitude: 113.401090
        },
        {
          id: 3,
          name: "松园",
          aliases: "松园",
          img: "/images/views/song-yuan.png",
          desc: "同样离饭堂很近",
          latitude: 22.047577,
          longitude: 113.401174
        },
        {
          id: 4,
          name: "桂园",
          aliases: "桂园",
          img: "/images/views/gui-yuan.png",
          desc: "离教学楼挺近",
          latitude: 22.048594,
          longitude: 113.400477
        },
        {
          id: 5,
          name: "梅园",
          aliases: "梅园",
          img: "/images/views/mei-yuan.png",
          desc: "离教学楼最近的宿舍楼",
          latitude: 22.052883,
          longitude: 113.403131
        },
        {
          id: 6,
          name: "榕园",
          aliases: "榕园",
          img: "/images/views/rong-yuan.png",
          desc: "全校最适合养老的宿舍楼",
          latitude: 22.053893,
          longitude: 113.404850
        }
      ]
    }
  ]
}