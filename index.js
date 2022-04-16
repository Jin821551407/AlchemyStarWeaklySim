// function resize() {
//     const screen = document.getElementsByClassName('screen')
//     screen[0].style.width = this.screen.innerWidth + 'px'
//     screen[0].style.height = this.screen.innerHeight + 'px'
// }

// window.onload = resize

// window.onresize = resize

new Vue({
    el:"#app",
    data(){
        return{
            //是否展开解释说明
            isExplain:false,
            //棋盘数组
            boardArray:[],
            //序列数组
            sequenceArray:[],
            //输入框序列号
            sequenceNumber:'',
            //输入框提示语
            tipsText:'',
            //人物走过的路径
            personArray:[],
            //棋盘行数
            rowCount: 9,
            //棋盘列数
            colCount: 9,
            //修改颜色选择的行数
            lastRowIndex: 0,
            //修改颜色选择的列数
            lastColIndex: 0,
            //修改选择的序列格子
            lastSeqIndex: 0,
            //当前是否处于修改模式 0 否 1 修改棋盘 2修改序列 3人物 4怪物
            isEdit: 0,
            //当前是否处于修改模式 0 否 1 修改棋盘 2修改序列 3人物 4怪物
            isInput: false,
            //人物X坐标
            personX:5,
            //人物Y坐标
            personY:2,
            //怪物坐标数组
            monsterArray:[
                {
                    x:2,
                    y:7
                }
            ],
            //当前选中怪物
            chooseMonster: '',
            //是否按住shift进行多选
            isShift: false,
            //修改颜色是否为多选
            isMultiple:false,
            //保存图片的数组
            picArr:[],
            //当前连线
            curLine:{
                //距离上边
                top:'0',
                //距离左边
                left:'0',
                //宽度
                width:'0',
                //高度
                height:'0',
                //旋转角度
                lineDeg: '0',
            },
            //盘面连线数组
            lineArr:[]
        }
    },
    mounted(){
        this.init()
    },
    methods:{
        //初始化
        async init(){
            console.log('')
            //加载时创建棋盘格子
            await this.createGrids()
            //全局绑定键盘事件
            this.bindKeyboardEvent()
            //读取历史棋盘数据
            this.picArr = JSON.parse(localStorage.getItem('myBorad')) || []
        },
        //加载时创建棋盘格子
        async createGrids(){
            this.boardArray = []
            for (let i = 0; i < this.rowCount; i++) {
                //装入每一行 共 8行
                this.boardArray.push([])
                for (let j = 0; j < this.colCount; j++) {
                    let obj = {
                        //当前格子是否边角 默认非边角
                        isCorner:false,
                        //当前格子在第几行
                        row:i,
                        //格子颜色
                        color:'',
                        //是否被选中
                        chooseBorder:false 
                    }
                    //默认选中 0 2
                    if(i==0&&j===2){
                        obj.chooseBorder = true
                        this.lastRowIndex = 0
                        this.lastColIndex = 2
                    }
                    //去掉边角
                    if(i===0&&j===0||i===1&&j===0||i===7&&j===0||i===8&&j===0||i===0&&j===1||i===8&&j===1||i===0&&j===7||i===8&&j===7||i===0&&j===8||i===1&&j===8||i===7&&j===8||i===8&&j===8){
                        obj.isCorner=true
                    }
                    //每一行装8个格子
                    this.boardArray[i].push(obj)
                }
            }
        },
        //选中格子(修改模式) 移动序列(操作模式)
        chooseGrid(row,col){
            //非编辑模式下点几格子是移动人物
            if(this.isEdit === 0 && this.sequenceArray.length>0 && !this.boardArray[row][col].isCorner){
                if(this.personY === row && this.personX === col){
                    return
                }
                /*
                创建连线
                */
               //单个格子大小是60*60
               const lineStartY = this.personY * 60 + 30
               const lineStartX = this.personX * 60 + 30
               const lineEndY = row * 60 + 30
               const lineEndX = col * 60 + 30
               //计算垂直与水平移动距离 勾股定理计算长度
                const deltaY = lineEndY - lineStartY
                const deltaX = lineEndX - lineStartX
               //计算连线长宽 旋转角度 旋转位置为开始位置 长度为斜边长 宽度默认为 3
                this.curLine.top = lineStartY
                this.curLine.left = lineStartX
                this.curLine.width = Math.sqrt(deltaY ** 2 + deltaX**2)
                this.curLine.height = 3
                //一象限
                if(deltaX>=0 && deltaY>=0){
                    this.curLine.lineDeg = Math.asin(deltaY/this.curLine.width)/Math.PI*180 // 对边除以斜边 
                }else if(deltaX>=0 && deltaY<0){
                //二象限
                this.curLine.lineDeg = Math.asin(deltaY/this.curLine.width)/Math.PI*180 // 对边除以斜边 
                }else if(deltaX<0 && deltaY>=0){
                //三象限
                this.curLine.lineDeg = 180 - Math.asin(deltaY/this.curLine.width)/Math.PI*180 // 对边除以斜边
                }else if(deltaX<0 && deltaY<0){
                //四象限
                this.curLine.lineDeg = 180 - Math.asin(deltaY/this.curLine.width)/Math.PI*180 // 对边除以斜边
                }
               //储存此次连线
               this.lineArr.push({...this.curLine})
                //存储此次 行数 列数
                let obj = {
                    lastPersonY:this.personY,
                    lastPersonX:this.personX,
                    lastColor:this.boardArray[this.personY][this.personX].color
                }
                //每次记录在头部 取的时候 就 取 0
                this.personArray.unshift(obj)
                //将人物离开的位置改变为序列的第一个颜色
                this.boardArray[this.personY][this.personX].color = this.sequenceArray[0].color
                /*
                改变序列
                */
                //同时删除第一个序列
                this.sequenceArray.shift()
                //同时删除第一个序列编号
                this.sequenceNumber = this.sequenceNumber.substring(1)
                /*
                改变人物
                */
                //再改变人物的位置
                this.personY = row
                this.personX = col
            }
            //编辑模式下点几格子是选择格子
            if(this.isEdit !== 0  && !this.boardArray[row][col].isCorner){
                // 此时没有按住shift
                if(!this.isShift){
                    //每次选择前先清空所有边框
                    this.boardArray.forEach( el => {
                        el.forEach(e => {
                            e.chooseBorder = false
                        })
                    })
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                    this.boardArray[row][col].chooseBorder = true
                    //存储此次 行数 列数
                    this.lastRowIndex = row
                    this.lastColIndex = col
                    this.isEdit = 1
                    //选择后 修改 isMultiple 为非多选
                    this.isMultiple = false
                } else {
                    //每次选择前先清空所有边框
                    this.boardArray.forEach( el => {
                        el.forEach(e => {
                            e.chooseBorder = false
                        })
                    })
                    //将对应范围的边框选中
                    this.boardArray.forEach( (el,i) => {
                        el.forEach((e,j) => {
                            if(this.lastRowIndex>=i&&i>=row&&this.lastColIndex>=j&&j>=col){
                                //不是边角才选中
                                e.chooseBorder = e.isCorner?false:true
                            } else if(this.lastRowIndex<=i&&i<=row&&this.lastColIndex>=j&&j>=col){
                                //不是边角才选中
                                e.chooseBorder = e.isCorner?false:true
                            } else if(this.lastRowIndex>=i&&i>=row&&this.lastColIndex<=j&&j<=col){
                                //不是边角才选中
                                e.chooseBorder = e.isCorner?false:true
                            } else if(this.lastRowIndex<=i&&i<=row&&this.lastColIndex<=j&&j<=col){
                                //不是边角才选中
                                e.chooseBorder = e.isCorner?false:true
                            }
                        })
                    })
                    //选择后 修改 isMultiple 为多选
                    this.isMultiple = true
                }
            }
        },
        //鼠标右键撤销回退
        cancelOperation(row,col){
            //非编辑模式下 右键是撤销操作
            if(this.isEdit === 0 && this.personArray.length>0){
                const{lastPersonY,lastPersonX} = this.personArray[0]
                //先撤回序列颜色
                let obj = {
                    //格子颜色
                    color:this.boardArray[lastPersonY][lastPersonX].color,
                    //是否被选中
                    chooseBorder:false 
                }
                this.sequenceArray.unshift(obj)
                //撤回上一步序列编号
                this.sequenceNumber = this.boardArray[lastPersonY][lastPersonX].color[0] + this.sequenceNumber
                //撤回上一步格子颜色
                this.boardArray[lastPersonY][lastPersonX].color = this.personArray[0].lastColor
                //改变人物的位置
                this.personY = lastPersonY
                this.personX = lastPersonX
                //删除当前人物撤回的记录
                this.personArray.shift()
                //撤回连线
                this.lineArr.pop()
            }
            //编辑模式选中人物下 右键是移动人物
            if(this.isEdit === 3){
                this.personY = row
                this.personX = col
            }
            //编辑模式选中怪物下 右键是移动怪物
            if(this.isEdit === 4){
                this.monsterArray[this.chooseMonster].y = row
                this.monsterArray[this.chooseMonster].x = col
            }
            
        },
        //增加序列
        addSequence(){
            let obj = {
                //格子颜色
                color:0,
                //是否被选中
                chooseBorder:false 
            }
            this.sequenceArray.push(obj)
        },
        //删除序列
        removeSequence(){
            this.sequenceArray.shift()
            this.sequenceNumber = this.sequenceNumber.substring(1)
        },
        //选择序列
        chooseSequence(index){
            if(this.isEdit!==0){
                this.sequenceArray.forEach(element => {
                    element.chooseBorder = false
                })
                this.sequenceArray[index].chooseBorder = true
                this.lastSeqIndex = index
                this.isEdit = 2
            }
        },
        //选择 3人物 4怪物
        choosePersonFun(){
            if(this.isEdit!==0){
                this.isEdit = 3
            }
        },
        //选择 3人物 4怪物
        chooseMonsterFun(index){
            if(this.isEdit!==0){
                this.chooseMonster = index
                this.isEdit = 4
            }
        },
        //修改格子颜色 移动人物或者怪物 todo
        async bindKeyboardEvent(){
            document.onkeydown=(event)=>{
                if(this.isEdit === 1&&!this.isInput){
                    if(event.key === 'Shift'){
                        this.isShift = true
                    }
                }
            }
            document.onkeyup=(event)=>{
                if(event.key === 'e' && this.isEdit===0){
                    //开启编辑模式 默认为选中棋盘
                    this.isEdit = 1
                    return
                }
                //改变棋盘颜色
                if(this.isEdit === 1&&!this.isInput){
                    // 1 2 3 4修改颜色
                    if(event.key === '0' || event.key === '1' || event.key ==='2' || event.key ==='3' || event.key ==='4'){
                        if(event.key === '0' ){
                            //遍历数组选中了的边框 变色
                            this.boardArray.forEach( el => {
                                el.forEach(e => {
                                    if(e.chooseBorder){
                                       e.color = event.key
                                    }
                                })
                            })
                        }else{
                            //遍历数组选中了的边框 变色
                            this.boardArray.forEach( el => {
                                el.forEach(e => {
                                    if(e.chooseBorder){
                                       e.color = event.key + (parseInt(Math.random()*3)+1) + (parseInt(Math.random()*4)+1)
                                    }
                                })
                            })
                        }
                        if(this.lastColIndex<8&&!this.isMultiple){
                            this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                            if(this.lastRowIndex===0&&this.lastColIndex===6){
                                this.lastRowIndex += 1
                                this.lastColIndex = 1
                            }else if(this.lastRowIndex===1&&this.lastColIndex===7){
                                this.lastRowIndex += 1
                                this.lastColIndex = 0
                            }else if(this.lastRowIndex===7&&this.lastColIndex===7){
                                this.lastRowIndex += 1
                                this.lastColIndex = 2
                            }else if(this.lastRowIndex===8&&this.lastColIndex===6){
                                this.lastRowIndex += 0
                                this.lastColIndex = 6
                            }else{
                                this.lastColIndex += 1
                            }
                            this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = true
                        }else if(this.lastRowIndex<8&&!this.isMultiple){
                            this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                            if(this.lastRowIndex===6&&this.lastColIndex===8){
                                this.lastRowIndex += 1
                                this.lastColIndex = 1
                            }else {
                                this.lastRowIndex += 1
                                this.lastColIndex = 0
                            }
                            this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = true
                        }
                    }
                    // 空格修改颜色
                    if(event.key === ' '){
                        //遍历数组选中了的边框 变色
                        this.boardArray.forEach( el => {
                            el.forEach(e => {
                                if(e.chooseBorder){
                                   e.color = event.key
                                }
                            })
                        })
                    }
                    if(event.key === 'a'){
                        //遍历数组选中了的边框 加怪物
                        this.boardArray.forEach( (el,i) => {
                            el.forEach((e,j) => {
                                if(e.chooseBorder){
                                   this.monsterArray.push({x:j,y:i})
                                }
                            })
                        })
                    }
                    if(event.key === 'Shift'){
                        this.isShift = false
                    }
                    // 在修改模式下关闭修改模式
                    if(event.key === 'e'){
                        this.isEdit = 0
                    }
                    return
                }
                //改变序列颜色
                if(this.isEdit === 2&&!this.isInput){
                    // 1 2 3 4修改颜色
                    if(event.key === '0' || event.key === '1' || event.key ==='2' || event.key ==='3' || event.key ==='4'){
                        this.sequenceArray[this.lastSeqIndex].color = event.key
                        if(event.key === '0' ){
                            this.sequenceArray[this.lastSeqIndex].color = event.key
                        }else{
                            this.sequenceArray[this.lastSeqIndex].color = event.key + (parseInt(Math.random()*3)+1) + (parseInt(Math.random()*4)+1)
                        }
                        //修改完当前格子颜色后 修改对应序列数字的编号
                        this.sequenceNumber = this.sequenceNumber.substring(0,this.lastSeqIndex)+event.key +this.sequenceNumber.substring(this.lastSeqIndex+1)
                        if(this.lastSeqIndex<this.sequenceArray.length-1){
                            this.sequenceArray[this.lastSeqIndex].chooseBorder = false
                            this.lastSeqIndex += 1
                            this.sequenceArray[this.lastSeqIndex].chooseBorder = true
                        }
                    }
                    //关闭编辑模式
                    if(event.key === 'e'){
                        this.isEdit = 0
                        return
                    }
                    //按d删除当前选中的序列颜色
                    if(event.key === 'd'){
                        this.sequenceArray = this.sequenceArray.filter((el,i)=>{
                            if(el.chooseBorder){
                                //删除对应序列编号
                                this.sequenceNumber = this.sequenceNumber.substring(0,this.lastSeqIndex)+''+this.sequenceNumber.substring(this.lastSeqIndex+1)
                            }
                            return !el.chooseBorder
                        })
                        if(this.lastSeqIndex<this.sequenceArray.length){
                            this.sequenceArray[this.lastSeqIndex].chooseBorder = true
                        }else if(this.lastSeqIndex>0){
                            this.sequenceArray[this.lastSeqIndex-1].chooseBorder = true
                            this.lastSeqIndex -= 1
                        }
                        return
                    }
                }
                //移动人物
                if(this.isEdit === 3){
                    // 向上移动修改
                    if(event.key === 'ArrowUp'&& this.personY>0){
                        this.personY -= 1
                    }
                    // 向下移动修改
                    if(event.key === 'ArrowDown'&& this.personY<this.rowCount-1){
                        this.personY += 1
                    }
                    // 向左移动修改
                    if(event.key === 'ArrowLeft'&& this.personX>0){
                        this.personX -= 1
                    }
                    // 向右移动修改
                    if(event.key === 'ArrowRight'&& this.personX<this.colCount-1){
                        this.personX += 1
                    }
                    if(event.key === 'e'){
                        this.isEdit = 0
                        return
                    }
                }
                //移动怪物
                if(this.isEdit === 4){
                    //
                    if(event.key === 'd'){
                        const {x,y} = this.monsterArray[this.chooseMonster]
                        //删除选中怪物
                        this.monsterArray.splice(this.chooseMonster,1)
                        //删除怪物后 清除选中格子 只选中当前格子 并改为棋盘编辑模式
                        this.boardArray.forEach( el => {
                            el.forEach(e => {
                                e.chooseBorder = false
                            })
                        })
                        this.boardArray[y][x].chooseBorder = true
                        this.isEdit = 1
                    }
                    // 向上移动修改
                    if(event.key === 'ArrowUp'&& this.monsterArray[this.chooseMonster].y>0){
                        this.monsterArray[this.chooseMonster].y -= 1
                    }
                    // 向下移动修改
                    if(event.key === 'ArrowDown'&& this.monsterArray[this.chooseMonster].y<this.rowCount-1){
                        this.monsterArray[this.chooseMonster].y += 1
                    }
                    // 向左移动修改
                    if(event.key === 'ArrowLeft'&& this.monsterArray[this.chooseMonster].x>0){
                        this.monsterArray[this.chooseMonster].x -= 1
                    }
                    // 向右移动修改
                    if(event.key === 'ArrowRight'&& this.monsterArray[this.chooseMonster].x<this.colCount-1){
                        this.monsterArray[this.chooseMonster].x += 1
                    }
                    if(event.key === 'e'){
                        this.isEdit = 0
                        return
                    }
                }
          }
        },
        //输入增加序列
        addSequenceColor(){
            //获取输入的序列号
            let value = this.sequenceNumber.trim()
            //验证序列号是否为纯数字
            let reg = /^[0-4]*$/
            let res =reg.test(value)
            if(res){
                this.tipsText=''
                this.sequenceArray = []
                let arr = value.split('')
                this.sequenceArray = arr.map(element => {
                    let obj = {
                        //格子颜色
                        color:element==='0'?element:element + (parseInt(Math.random()*3)+1) + (parseInt(Math.random()*4)+1),
                        //是否被选中
                        chooseBorder:false 
                    }
                    return obj
                })
            }else{
                this.tipsText='请输入正确的序列号（由数字01234组成）'
            }
        },
        //获得焦点
        focus(){
            this.isInput=true
        },
        //失去焦点
        blur(){
            this.isInput=false
        },
        save(){
            html2canvas(document.getElementById('board'),{

                // width:'100',
                // height:'100',
                // useCORS:true,
                // backgroundColor:'#bbffaa',
                // windowWidth: document.getElementById('board').scrollWidth,
                // windowHeight: document.getElementById('board').scrollHeight
            }).then((canvas)=>{
                const obj = {
                    //当前画布的截图
                    picData:canvas.toDataURL("image/png"),
                    //当前画布的颜色数据
                    boardArray:JSON.parse(JSON.stringify(this.boardArray)),
                    //当前画布的连线数据
                    lineArr:JSON.parse(JSON.stringify(this.lineArr)),
                    //当前的怪物位置
                    monsterArray:JSON.parse(JSON.stringify(this.monsterArray)),
                    //当前的人物位置
                    personX:this.personX,
                    //当前的人物位置
                    personY:this.personY,
                    //人物走过的路径
                    personArray:JSON.parse(JSON.stringify(this.personArray))
                }
                this.picArr.push(obj)
                //清空当前画布连线
                this.lineArr = []
                //清空人物走过的路线
                this.personArray = []
                //本地存储记录
                localStorage.setItem('myBorad',JSON.stringify(this.picArr))
            })
        },
        //点击缩略图还原棋盘
        restoreBoard(picIndex){
            if(confirm(`确定恢复棋盘${picIndex+1}?`)){
                //恢复画布的颜色数据
                this.boardArray = JSON.parse(JSON.stringify(this.picArr[picIndex].boardArray))
                //恢复画布的连线数据
                this.lineArr = JSON.parse(JSON.stringify(this.picArr[picIndex].lineArr))
                //恢复怪物位置
                this.monsterArray = JSON.parse(JSON.stringify(this.picArr[picIndex].monsterArray))
                //恢复人物位置
                this.personX = this.picArr[picIndex].personX
                //恢复人物位置
                this.personY = this.picArr[picIndex].personY
                //恢复人物走过的路线
                this.personArray = JSON.parse(JSON.stringify(this.picArr[picIndex].personArray))
            }
        },
        //右键删除截图
        deletePic(picIndex){
            if(confirm(`确定删除棋盘${picIndex+1}?`)){
                this.picArr.splice(picIndex,1)
                //本地存储记录
                localStorage.setItem('myBorad',JSON.stringify(this.picArr))
            }
        }
    }
})