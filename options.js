var fs = require('fs');

var configPath = './config.json';

// General program-wide settings

exports.settings = {

    // 1 - Connect all the #words within a 4-word gap in the statement to each other 连接所有的#单词在一个4字的差距在声明中
    // 0 - Connect only the words that are next to each other 连接相邻的单词
    fullscan: 1,

    // 1 - Graph shows connections between both the words that are next to each and also within the 4-word gap 图显示两相邻的单词之间的联系,也在4字的差距
    // 0 - Graph shows only words that are next to each other 图只显示相邻的单词
    fullview: 1,

    // 1 - Either the hashtags or the words can be the nodes for each statement 标签或单词可以每个语句的节点
    // 0 - The nodes in the graph are both the words and the hashtags 图中的节点都是文字和标签
    hashnodes: 0,

    // 1 - #hashtags are automatically converted to their morphemes (#cats = #cat, #taken = #take) 标签会自动转化为他们的词素
    // 0 - #hashtags stay like they are 保持原样
    morphemes: 0,

    // Max number of contexts in one statement 在一个声明中最大数量的上下文
    max_contexts: 5,

    // Max length of a statement text 语句 最大长度
    max_text_length: 4500,

    // Min length of a statement text 语句 最小长度
    min_text_length: 4,

    // Max number of tags in one statement 语句 最大标签数
    max_hashtags: 100,

    // Max nodes to show in a graph 图中最大节点数
    max_nodes: 150


}

/*
exports.defaultstatements = {
    f: 'every note can be saved in several contexts or lists. these notes are in the "help" context - click the context name in the left sidebar and then scroll down to delete the context with all the notes.',
    e: 'to get started, import your tweets, evernote and gmail / iphone notes using the import function in the left sidebar.',
    d: 'try to click on several words in the graph: you will see only the notes that contain those words.',
    c: 'try to add a new note. if you use #hashtags, only those #hashtags will be added into the #graph, not the other words you use. #great-feature #web #infranodus #amazing #nice ',
    b: 'this is a note. click it once to see it in the graph. double-click it to edit or to delete.',
    a: 'welcome! using infranodus you can discover how your different notes and ideas connect using a graph.'
}
*/


// Config file exists?

if (fs.existsSync(configPath)) {

    var parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

    // Create Neo4J access URL 创建neo4j访问链接
    exports.neo4jlink = "http://" + parsed['neo4j']['username'] +
                        ":" + parsed['neo4j']['password'] +
                        "@" + parsed['neo4j']['host'];

    exports.invite = parsed['secrets']['invitation'];

    exports.default_user = parsed['infranodus']['default_user'];


}

else {

    console.log("Neo4J config file doesn't exist. Using default settings.");

    exports.neo4jlink = "http://localhost:7474";
    exports.invite = '';
}


// Get a list of stopwords for English
// 获取英文停用词列表

fs.readFile( __dirname + '/public/files/stopwords_en_en.txt', function (err, data) {
    if (err) {
        throw err;
    }

    exports.stopwords_en = data.toString().split("\n");

});


// Get a list of stopwords for Russian
// 获取俄语停用词列表

fs.readFile( __dirname + '/public/files/stopwords_ru_ru.txt', function (err, data) {
    if (err) {
        throw err;
    }

    exports.stopwords_ru = data.toString().split("\n");

});




// Get a list of stopwords for French
// 获取法语停用词列表
fs.readFile( __dirname + '/public/files/stopwords_fr_fr.txt', function (err, data) {
    if (err) {
        throw err;
    }

    exports.stopwords_fr = data.toString().split("\n");

});


// Get a list of stopwords for German
// 获取德语停用词列表
fs.readFile( __dirname + '/public/files/stopwords_de_de.txt', function (err, data) {
    if (err) {
        throw err;
    }

    exports.stopwords_de = data.toString().split("\n");

});

// Get a list of stopwords for Spanish
// 获取西班牙语停用词列表
fs.readFile( __dirname + '/public/files/stopwords_es_es.txt', function (err, data) {
    if (err) {
        throw err;
    }

    exports.stopwords_es = data.toString().split("\n");

});


// Diacritics table 变音符号表

exports.accentmap = [{
    'base': "A",
    'letters': /(&#65;|&#9398;|&#65313;|&#192;|&#193;|&#194;|&#7846;|&#7844;|&#7850;|&#7848;|&#195;|&#256;|&#258;|&#7856;|&#7854;|&#7860;|&#7858;|&#550;|&#480;|&#196;|&#478;|&#7842;|&#197;|&#506;|&#461;|&#512;|&#514;|&#7840;|&#7852;|&#7862;|&#7680;|&#260;|&#570;|&#11375;|[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F])/g
}, {
    'base': "AA",
    'letters': /(&#42802;|[\uA732])/g
}, {
    'base': "AE",
    'letters': /(&#198;|&#508;|&#482;|[\u00C6\u01FC\u01E2])/g
}, {
    'base': "AO",
    'letters': /(&#42804;|[\uA734])/g
}, {
    'base': "AU",
    'letters': /(&#42806;|[\uA736])/g
}, {
    'base': "AV",
    'letters': /(&#42808;|&#42810;|[\uA738\uA73A])/g
}, {
    'base': "AY",
    'letters': /(&#42812;|[\uA73C])/g
}, {
    'base': "B",
    'letters': /(&#66;|&#9399;|&#65314;|&#7682;|&#7684;|&#7686;|&#579;|&#386;|&#385;|[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181])/g
}, {
    'base': "C",
    'letters': /(&#67;|&#9400;|&#65315;|&#262;|&#264;|&#266;|&#268;|&#199;|&#7688;|&#391;|&#571;|&#42814;|[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E])/g
}, {
    'base': "D",
    'letters': /(&#68;|&#9401;|&#65316;|&#7690;|&#270;|&#7692;|&#7696;|&#7698;|&#7694;|&#272;|&#395;|&#394;|&#393;|&#42873;|&#208;|[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0])/g
}, {
    'base': "DZ",
    'letters': /(&#497;|&#452;|[\u01F1\u01C4])/g
}, {
    'base': "Dz",
    'letters': /(&#498;|&#453;|[\u01F2\u01C5])/g
}, {
    'base': "E",
    'letters': /(&#69;|&#9402;|&#65317;|&#200;|&#201;|&#202;|&#7872;|&#7870;|&#7876;|&#7874;|&#7868;|&#274;|&#7700;|&#7702;|&#276;|&#278;|&#203;|&#7866;|&#282;|&#516;|&#518;|&#7864;|&#7878;|&#552;|&#7708;|&#280;|&#7704;|&#7706;|&#400;|&#398;|[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E])/g
}, {
    'base': "F",
    'letters': /(&#70;|&#9403;|&#65318;|&#7710;|&#401;|&#42875;|[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B])/g
}, {
    'base': "G",
    'letters': /(&#71;|&#9404;|&#65319;|&#500;|&#284;|&#7712;|&#286;|&#288;|&#486;|&#290;|&#484;|&#403;|&#42912;|&#42877;|&#42878;|[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E])/g
}, {
    'base': "H",
    'letters': /(&#72;|&#9405;|&#65320;|&#292;|&#7714;|&#7718;|&#542;|&#7716;|&#7720;|&#7722;|&#294;|&#11367;|&#11381;|&#42893;|[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D])/g
}, {
    'base': "I",
    'letters': /(&#73;|&#9406;|&#65321;|&#204;|&#205;|&#206;|&#296;|&#298;|&#300;|&#304;|&#207;|&#7726;|&#7880;|&#463;|&#520;|&#522;|&#7882;|&#302;|&#7724;|&#407;|[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197])/g
}, {
    'base': "J",
    'letters': /(&#74;|&#9407;|&#65322;|&#308;|&#584;|[\u004A\u24BF\uFF2A\u0134\u0248])/g
}, {
    'base': "K",
    'letters': /(&#75;|&#9408;|&#65323;|&#7728;|&#488;|&#7730;|&#310;|&#7732;|&#408;|&#11369;|&#42816;|&#42818;|&#42820;|&#42914;|[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2])/g
}, {
    'base': "L",
    'letters': /(&#76;|&#9409;|&#65324;|&#319;|&#313;|&#317;|&#7734;|&#7736;|&#315;|&#7740;|&#7738;|&#321;|&#573;|&#11362;|&#11360;|&#42824;|&#42822;|&#42880;|[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780])/g
}, {
    'base': "LJ",
    'letters': /(&#455;|[\u01C7])/g
}, {
    'base': "Lj",
    'letters': /(&#456;|[\u01C8])/g
}, {
    'base': "M",
    'letters': /(&#77;|&#9410;|&#65325;|&#7742;|&#7744;|&#7746;|&#11374;|&#412;|[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C])/g
}, {
    'base': "N",
    'letters': /(&#78;|&#9411;|&#65326;|&#504;|&#323;|&#209;|&#7748;|&#327;|&#7750;|&#325;|&#7754;|&#7752;|&#544;|&#413;|&#42896;|&#42916;|&#330;|[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4\u014A])/g
}, {
    'base': "NJ",
    'letters': /(&#458;|[\u01CA])/g
}, {
    'base': "Nj",
    'letters': /(&#459;|[\u01CB])/g
}, {
    'base': "O",
    'letters': /(&#79;|&#9412;|&#65327;|&#210;|&#211;|&#212;|&#7890;|&#7888;|&#7894;|&#7892;|&#213;|&#7756;|&#556;|&#7758;|&#332;|&#7760;|&#7762;|&#334;|&#558;|&#560;|&#214;|&#554;|&#7886;|&#336;|&#465;|&#524;|&#526;|&#416;|&#7900;|&#7898;|&#7904;|&#7902;|&#7906;|&#7884;|&#7896;|&#490;|&#492;|&#216;|&#510;|&#390;|&#415;|&#42826;|&#42828;|[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C])/g
}, {
    'base': "OE",
    'letters': /(&#338;|[\u0152])/g
}, {
    'base': "OI",
    'letters': /(&#418;|[\u01A2])/g
}, {
    'base': "OO",
    'letters': /(&#42830;|[\uA74E])/g
}, {
    'base': "OU",
    'letters': /(&#546;|[\u0222])/g
}, {
    'base': "P",
    'letters': /(&#80;|&#9413;|&#65328;|&#7764;|&#7766;|&#420;|&#11363;|&#42832;|&#42834;|&#42836;|[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754])/g
}, {
    'base': "Q",
    'letters': /(&#81;|&#9414;|&#65329;|&#42838;|&#42840;|&#586;|[\u0051\u24C6\uFF31\uA756\uA758\u024A])/g
}, {
    'base': "R",
    'letters': /(&#82;|&#9415;|&#65330;|&#340;|&#7768;|&#344;|&#528;|&#530;|&#7770;|&#7772;|&#342;|&#7774;|&#588;|&#11364;|&#42842;|&#42918;|&#42882;|[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782])/g
}, {
    'base': "S",
    'letters': /(&#83;|&#9416;|&#65331;|&#7838;|&#346;|&#7780;|&#348;|&#7776;|&#352;|&#7782;|&#7778;|&#7784;|&#536;|&#350;|&#11390;|&#42920;|&#42884;|[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784])/g
}, {
    'base': "T",
    'letters': /(&#84;|&#9417;|&#65332;|&#7786;|&#356;|&#7788;|&#538;|&#354;|&#7792;|&#7790;|&#358;|&#428;|&#430;|&#574;|&#42886;|[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786])/g
}, {
    'base': "TH",
    'letters': /(&#222;|[\u00DE])/g
}, {
    'base': "TZ",
    'letters': /(&#42792;|[\uA728])/g
}, {
    'base': "U",
    'letters': /(&#85;|&#9418;|&#65333;|&#217;|&#218;|&#219;|&#360;|&#7800;|&#362;|&#7802;|&#364;|&#220;|&#475;|&#471;|&#469;|&#473;|&#7910;|&#366;|&#368;|&#467;|&#532;|&#534;|&#431;|&#7914;|&#7912;|&#7918;|&#7916;|&#7920;|&#7908;|&#7794;|&#370;|&#7798;|&#7796;|&#580;|[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244])/g
}, {
    'base': "V",
    'letters': /(&#86;|&#9419;|&#65334;|&#7804;|&#7806;|&#434;|&#42846;|&#581;|[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245])/g
}, {
    'base': "VY",
    'letters': /(&#42848;|[\uA760])/g
}, {
    'base': "W",
    'letters': /(&#87;|&#9420;|&#65335;|&#7808;|&#7810;|&#372;|&#7814;|&#7812;|&#7816;|&#11378;|[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72])/g
}, {
    'base': "X",
    'letters': /(&#88;|&#9421;|&#65336;|&#7818;|&#7820;|[\u0058\u24CD\uFF38\u1E8A\u1E8C])/g
}, {
    'base': "Y",
    'letters': /(&#89;|&#9422;|&#65337;|&#7922;|&#221;|&#374;|&#7928;|&#562;|&#7822;|&#376;|&#7926;|&#7924;|&#435;|&#590;|&#7934;|[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE])/g
}, {
    'base': "Z",
    'letters': /(&#90;|&#9423;|&#65338;|&#377;|&#7824;|&#379;|&#381;|&#7826;|&#7828;|&#437;|&#548;|&#11391;|&#11371;|&#42850;|[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762])/g
}, {
    'base': "a",
    'letters': /(&#97;|&#9424;|&#65345;|&#7834;|&#224;|&#225;|&#226;|&#7847;|&#7845;|&#7851;|&#7849;|&#227;|&#257;|&#259;|&#7857;|&#7855;|&#7861;|&#7859;|&#551;|&#481;|&#228;|&#479;|&#7843;|&#229;|&#507;|&#462;|&#513;|&#515;|&#7841;|&#7853;|&#7863;|&#7681;|&#261;|&#11365;|&#592;|[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250])/g
}, {
    'base': "aa",
    'letters': /(&#42803;|[\uA733])/g
}, {
    'base': "ae",
    'letters': /(&#230;|&#509;|&#483;|[\u00E6\u01FD\u01E3])/g
}, {
    'base': "ao",
    'letters': /(&#42805;|[\uA735])/g
}, {
    'base': "au",
    'letters': /(&#42807;|[\uA737])/g
}, {
    'base': "av",
    'letters': /(&#42809;|&#42811;|[\uA739\uA73B])/g
}, {
    'base': "ay",
    'letters': /(&#42813;|[\uA73D])/g
}, {
    'base': "b",
    'letters': /(&#98;|&#9425;|&#65346;|&#7683;|&#7685;|&#7687;|&#384;|&#387;|&#595;|[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253])/g
}, {
    'base': "c",
    'letters': /(&#99;|&#9426;|&#65347;|&#263;|&#265;|&#267;|&#269;|&#231;|&#7689;|&#392;|&#572;|&#42815;|&#8580;|[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184])/g
}, {
    'base': "d",
    'letters': /(&#100;|&#9427;|&#65348;|&#7691;|&#271;|&#7693;|&#7697;|&#7699;|&#7695;|&#273;|&#396;|&#598;|&#599;|&#42874;|&#240;|[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A\u00F0])/g
}, {
    'base': "dz",
    'letters': /(&#499;|&#454;|[\u01F3\u01C6])/g
}, {
    'base': "e",
    'letters': /(&#101;|&#9428;|&#65349;|&#232;|&#233;|&#234;|&#7873;|&#7871;|&#7877;|&#7875;|&#7869;|&#275;|&#7701;|&#7703;|&#277;|&#279;|&#235;|&#7867;|&#283;|&#517;|&#519;|&#7865;|&#7879;|&#553;|&#7709;|&#281;|&#7705;|&#7707;|&#583;|&#603;|&#477;|[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD])/g
}, {
    'base': "f",
    'letters': /(&#102;|&#9429;|&#65350;|&#7711;|&#402;|&#42876;|[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C])/g
}, {
    'base': "g",
    'letters': /(&#103;|&#9430;|&#65351;|&#501;|&#285;|&#7713;|&#287;|&#289;|&#487;|&#291;|&#485;|&#608;|&#42913;|&#7545;|&#42879;|[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F])/g
}, {
    'base': "h",
    'letters': /(&#104;|&#9431;|&#65352;|&#293;|&#7715;|&#7719;|&#543;|&#7717;|&#7721;|&#7723;|&#7830;|&#295;|&#11368;|&#11382;|&#613;|[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265])/g
}, {
    'base': "hv",
    'letters': /(&#405;|[\u0195])/g
}, {
    'base': "i",
    'letters': /(&#105;|&#9432;|&#65353;|&#236;|&#237;|&#238;|&#297;|&#299;|&#301;|&#239;|&#7727;|&#7881;|&#464;|&#521;|&#523;|&#7883;|&#303;|&#7725;|&#616;|&#305;|[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131])/g
}, {
    'base': "ij",
    'letters': /(&#307;|[\u0133])/g
}, {
    'base': "j",
    'letters': /(&#106;|&#9433;|&#65354;|&#309;|&#496;|&#585;|[\u006A\u24D9\uFF4A\u0135\u01F0\u0249])/g
}, {
    'base': "k",
    'letters': /(&#107;|&#9434;|&#65355;|&#7729;|&#489;|&#7731;|&#311;|&#7733;|&#409;|&#11370;|&#42817;|&#42819;|&#42821;|&#42915;|[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3])/g
}, {
    'base': "l",
    'letters': /(&#108;|&#9435;|&#65356;|&#320;|&#314;|&#318;|&#7735;|&#7737;|&#316;|&#7741;|&#7739;|&#322;|&#410;|&#619;|&#11361;|&#42825;|&#42881;|&#42823;|[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u0142\u019A\u026B\u2C61\uA749\uA781\uA747])/g
}, {
    'base': "lj",
    'letters': /(&#457;|[\u01C9])/g
}, {
    'base': "m",
    'letters': /(&#109;|&#9436;|&#65357;|&#7743;|&#7745;|&#7747;|&#625;|&#623;|[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F])/g
}, {
    'base': "n",
    'letters': /(&#110;|&#9437;|&#65358;|&#505;|&#324;|&#241;|&#7749;|&#328;|&#7751;|&#326;|&#7755;|&#7753;|&#414;|&#626;|&#329;|&#42897;|&#42917;|&#331;|[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5\u014B])/g
}, {
    'base': "nj",
    'letters': /(&#460;|[\u01CC])/g
}, {
    'base': "o",
    'letters': /(&#111;|&#9438;|&#65359;|&#242;|&#243;|&#244;|&#7891;|&#7889;|&#7895;|&#7893;|&#245;|&#7757;|&#557;|&#7759;|&#333;|&#7761;|&#7763;|&#335;|&#559;|&#561;|&#246;|&#555;|&#7887;|&#337;|&#466;|&#525;|&#527;|&#417;|&#7901;|&#7899;|&#7905;|&#7903;|&#7907;|&#7885;|&#7897;|&#491;|&#493;|&#248;|&#511;|&#596;|&#42827;|&#42829;|&#629;|[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275])/g
}, {
    'base': "oe",
    'letters': /(&#339;|[\u0153])/g
}, {
    'base': "oi",
    'letters': /(&#419;|[\u01A3])/g
}, {
    'base': "ou",
    'letters': /(&#547;|[\u0223])/g
}, {
    'base': "oo",
    'letters': /(&#42831;|[\uA74F])/g
}, {
    'base': "p",
    'letters': /(&#112;|&#9439;|&#65360;|&#7765;|&#7767;|&#421;|&#7549;|&#42833;|&#42835;|&#42837;|[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755])/g
}, {
    'base': "q",
    'letters': /(&#113;|&#9440;|&#65361;|&#587;|&#42839;|&#42841;|[\u0071\u24E0\uFF51\u024B\uA757\uA759])/g
}, {
    'base': "r",
    'letters': /(&#114;|&#9441;|&#65362;|&#341;|&#7769;|&#345;|&#529;|&#531;|&#7771;|&#7773;|&#343;|&#7775;|&#589;|&#637;|&#42843;|&#42919;|&#42883;|[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783])/g
}, {
    'base': "s",
    'letters': /(&#115;|&#9442;|&#65363;|&#347;|&#7781;|&#349;|&#7777;|&#353;|&#7783;|&#7779;|&#7785;|&#537;|&#351;|&#575;|&#42921;|&#42885;|&#7835;|&#383;|[\u0073\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B\u017F])/g
}, {
    'base': "ss",
    'letters': /(&#223;|[\u00DF])/g
}, {
    'base': "t",
    'letters': /(&#116;|&#9443;|&#65364;|&#7787;|&#7831;|&#357;|&#7789;|&#539;|&#355;|&#7793;|&#7791;|&#359;|&#429;|&#648;|&#11366;|&#42887;|[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787])/g
}, {
    'base': "th",
    'letters': /(&#254;|[\u00FE])/g
}, {
    'base': "tz",
    'letters': /(&#42793;|[\uA729])/g
}, {
    'base': "u",
    'letters': /(&#117;|&#9444;|&#65365;|&#249;|&#250;|&#251;|&#361;|&#7801;|&#363;|&#7803;|&#365;|&#252;|&#476;|&#472;|&#470;|&#474;|&#7911;|&#367;|&#369;|&#468;|&#533;|&#535;|&#432;|&#7915;|&#7913;|&#7919;|&#7917;|&#7921;|&#7909;|&#7795;|&#371;|&#7799;|&#7797;|&#649;|[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289])/g
}, {
    'base': "v",
    'letters': /(&#118;|&#9445;|&#65366;|&#7805;|&#7807;|&#651;|&#42847;|&#652;|[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C])/g
}, {
    'base': "vy",
    'letters': /(&#42849;|[\uA761])/g
}, {
    'base': "w",
    'letters': /(&#119;|&#9446;|&#65367;|&#7809;|&#7811;|&#373;|&#7815;|&#7813;|&#7832;|&#7817;|&#11379;|[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73])/g
}, {
    'base': "x",
    'letters': /(&#120;|&#9447;|&#65368;|&#7819;|&#7821;|[\u0078\u24E7\uFF58\u1E8B\u1E8D])/g
}, {
    'base': "y",
    'letters': /(&#121;|&#9448;|&#65369;|&#7923;|&#253;|&#375;|&#7929;|&#563;|&#7823;|&#255;|&#7927;|&#7833;|&#7925;|&#436;|&#591;|&#7935;|[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF])/g
}, {
    'base': "z",
    'letters': /(&#122;|&#9449;|&#65370;|&#378;|&#7825;|&#380;|&#382;|&#7827;|&#7829;|&#438;|&#549;|&#576;|&#11372;|&#42851;|[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763])/g
}];


exports.digitsmap = [
    {
        'base': /(0)/g,
        'letters': "zero"
    }, {
        'base': /(1)/g,
        'letters': "one"
    }, {
        'base': /(2)/g,
        'letters': "two"
    }, {
        'base': /(3)/g,
        'letters': "three"
    }, {
        'base': /(4)/g,
        'letters': "four"
    }, {
        'base': /(5)/g,
        'letters': "five"
    }, {
        'base': /(6)/g,
        'letters': "six"
    }, {
        'base': /(7)/g,
        'letters': "seven"
    }, {
        'base': /(8)/g,
        'letters': "eight"
    }, {
        'base': /(9)/g,
        'letters': "nine"
    }];