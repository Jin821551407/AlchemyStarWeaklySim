window.onload = function() {
    const screen = document.getElementsByClassName('screen')
    screen[0].style.width = this.innerWidth + 'px'
    screen[0].style.height = this.innerHeight + 'px'
}

new Vue({
    el:"#app",
    data(){
        return{
            //棋盘数组
            boardArray:[],
            //棋盘行数
            rowCount: 8,
            //棋盘列数
            colCount:8,
            //修改颜色选择的行数
            lastRowIndex: 0,
            //修改颜色选择的列数
            lastColIndex: 0
        }
    },
    mounted(){
        this.createGrids()
        //全局绑定键盘事件
        this.bindKeyboardEvent()
    },
    methods:{
        //加载时创建棋盘格子
        createGrids(){
            this.boardArray = []
            for (let i = 0; i < this.rowCount; i++) {
                //装入每一行 共 8行
                this.boardArray.push([])
                for (let j = 0; j < this.colCount; j++) {
                    let obj = {
                        //当前格子在第几行
                        row:i,
                        //格子颜色
                        color:0,
                        //是否被选中
                        chooseBorder:false 
                    }
                    //每一行装8个格子
                    this.boardArray[i].push(obj)
                }
            }
        },
        //选中格子
        chooseGrid(row,col){
            this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
            this.boardArray[row][col].chooseBorder = true
            //存储此次 行数 列数
            this.lastRowIndex = row
            this.lastColIndex = col
        },
        //修改格子颜色
        bindKeyboardEvent(){
            document.onkeyup=(event)=>{
                // 1 2 3 4修改颜色
                if(event.key === '1' || event.key ==='2' || event.key ==='3' || event.key ==='4'){
                    this.boardArray[this.lastRowIndex][this.lastColIndex].color = event.key
                }
                // 空格修改颜色
                if(event.key === ' '){
                    this.boardArray[this.lastRowIndex][this.lastColIndex].color = event.key
                }
                if(event.key === 'ArrowUp'&& this.lastRowIndex>0){
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                    this.lastRowIndex -= 1
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = true
                }
                if(event.key === 'ArrowDown'&& this.lastRowIndex<this.rowCount-1){
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                    this.lastRowIndex += 1
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = true
                }
                if(event.key === 'ArrowLeft'&& this.lastColIndex>0){
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                    this.lastColIndex -= 1
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = true
                }
                if(event.key === 'ArrowRight'&& this.lastColIndex<this.colCount-1){
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = false
                    this.lastColIndex += 1
                    this.boardArray[this.lastRowIndex][this.lastColIndex].chooseBorder = true
                } ' '
          }
        }
    }
})