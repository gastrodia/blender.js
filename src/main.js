/**
 * Created by ELatA on 14-3-3.
 */
/**
 * Created by ELatA on 14-2-26.
 */
//container是指页面放置这个webGL的一个层  stats是指
var container, stats;
//camera是指场景相机 controls是指控制器，比如一般的鼠标视角控制等  scene是场景，就好像一个大的舞台
//projector是可能指屏幕和场景转换工具 renderer是指场景渲染，能把场景呈现到浏览器里
var camera, controls, scene, projector, renderer;
//objects是指场景中的实体集合  plane是一个水平面网格，当选中一个物体时，可以通过这个水平面，看到和它在同一平面内的其他物理
var objects = [], plane;
//mouse，鼠标所对应的二维向量  offset 是指三维偏移向量 INTERSECTED是指相交的对象 SELECTED选中的对象
var mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    INTERSECTED, SELECTED;

//初始化整个场景
init();
//开始每秒最大60帧的渲染
animate();



function init() {
    //创建一个放置webGL的层
    container = document.createElement( 'div' );
    //把上面的层放到body里
    document.body.appendChild( container );
    //创建一个透视相机 可视角度70度 浏览器的全屏的宽高 水平视锥 最近1 最远10000
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

    camera.position.set(74.970194060779,159.2433545390028,279.79257328812173);

    //相机的位置z正半轴3000

    //轨迹球控制 鼠标左击旋转  右击平移 滚轮远近
    controls = new THREE.OrbitControls( camera );
    //旋转速度
    controls.rotateSpeed = 1.0;
    //变焦速度
    controls.zoomSpeed = 1.2;
    //平移速度
    controls.panSpeed = 0.8;
    //是否不变焦
    controls.noZoom = false;
    //是否不平移
    controls.noPan = true;
    //可能是惯性 true没有惯性
    controls.staticMoving = false;
    //动态阻尼系数 就是灵敏度
    controls.dynamicDampingFactor = 0.3;

    //新建一个场景
    scene = new THREE.Scene();


    //新建一个环境光 就是正常物体都能照到的光
    var ambientLight = new THREE.AmbientLight(0xffffff );
    //把环境光加到场景中
    scene.add( ambientLight );
    //再新建一个无线远的平行光，就是像太阳光一样的，
    var directionalLight = new THREE.DirectionalLight(0xffffff );
    //把平行光放在y轴正方向上的无穷远处
    directionalLight.position.set( 0, 1, -200);
    //把平行光加到场景中
    scene.add( directionalLight );












    //创建一个长2000宽2000，8*8的网格对象并加上一种基本材质
    plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
    plane.position.x = plane.position.y = plane.position.z = 0;
    plane.lookAt( new THREE.Vector3 (0.0, 1.0, 0.0) );

    //网格对象是否可见
    plane.visible = true;
    //把网格对象加到场景中
    scene.add( plane );

    //创建一个屏幕和场景转换工具
    projector = new THREE.Projector();
    //创建一个抗锯齿的webgl渲染器
    renderer = new THREE.WebGLRenderer( { antialias: true , alpha: true} );
    //renderer.setClearColorHex(0xEEEEEE);两种让背景变白的方式
    //是否排列对象 默认是true
    renderer.sortObjects = false;
    //设置渲染的范围
    renderer.setSize( window.innerWidth, window.innerHeight );
    //是否启用阴影地图
    renderer.shadowMapEnabled = true;
    //设置阴影地图是纹理阴影
    renderer.shadowMapType = THREE.PCFShadowMap;
    //把渲染成的所有页面标签加入到webgl层中
    container.appendChild( renderer.domElement );

    //显示了一个左上角的性能监视窗口
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    //加入鼠标拖动对象的一系列监听事件
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

    $(renderer.domElement).dblclick(function(event){
        //event.preventDefault();
        var mouse_x = ( event.clientX / window.innerWidth ) * 2 - 1;
        var mouse_y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        var vector = new THREE.Vector3(mouse_x, mouse_y, 0.5 );
        var selected = raySelect(vector);


        if (selected && selected.name.split("-").shift() == "TextPanel") {
            var text=prompt("请入如条幅文字","");
            if (text!=null){
                textPanel.update(text);
            }
            if ( INTERSECTED ) {
                //把位置给水平面
                plane.position.copy( INTERSECTED.position );
                //选中物体置空
                SELECTED = null;

            }
        }
    });
    //加入窗口改变大小时的监听事件
    window.addEventListener( 'resize', onWindowResize, false );
    $(window).keyup(function(event){
        console.log(event);
        var rotateing = false;
        if(event.keyCode == 82){ //r
            var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
            select = raySelect(vector.clone());
            if(select){
                var O = select.position;
                var A =  projector.unprojectVector( vector, camera );
                rotateing = true;
                renderer.domElement.addEventListener( 'mousemove',rotate , false );
                renderer.domElement.addEventListener('mouseup',stopRotate,false);
            }
        }
        function stopRotate(event){
            if(rotateing){
                renderer.domElement.removeEventListener( 'mousemove',rotate);
                renderer.domElement.removeEventListener('mouseup',stopRotate);
                rotateing = false;
            }
        }
        function rotate(event){
            var mouse_x = ( event.clientX / window.innerWidth ) * 2 - 1;
            var mouse_y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            var vector = new THREE.Vector3(  mouse_x , mouse_y, 0.5 );
            var B =  projector.unprojectVector( vector, camera );
            var distance = A.distanceTo(B);
            select.rotation.y = distance;
        }

    });

}


var showingAxes = null;

function showSelect(selected){
    var axes = new THREE.AxisHelper(20);
    axes.position = selected.position;
    if(showingAxes){
        scene.remove(showingAxes);
        scene.add(axes);
        showingAxes = axes;
    }else{
        scene.add(axes);
        showingAxes = axes;
    }

}

function raySelect(vector){
    var selected = null;
    projector.unprojectVector( vector, camera );
    console.log(vector);
    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {
        selected = intersects[ 0 ].object;
        //再和水平面相交,更新偏移
        var intersects = raycaster.intersectObject( plane );
        //选中位置和水平面位置（物体中心）的偏移量
        if(intersects[ 0 ]){
            offset.copy( intersects[ 0 ].point ).sub( plane.position) ;
        }
    }
    return selected;
}


function onDocumentMouseUp( event ) {

    event.preventDefault();
    //又能改变视角了
    controls.enabled = true;
    //如果有相交物体
    if ( INTERSECTED ) {
        //把位置给水平面
        plane.position.copy( INTERSECTED.position );
        //选中物体置空
        SELECTED = null;

    }
    //改变鼠标的样式
    container.style.cursor = 'auto';

}

//每秒最大60帧的渲染，一直在循环
function animate() {
    //循环本身
    requestAnimationFrame( animate );
    //渲染场景
    render();
    //更新性能监视窗口
    stats.update();

}

function render() {
    //更新控制器
    controls.update();
    //渲染场景和相机
    renderer.render( scene, camera );
}