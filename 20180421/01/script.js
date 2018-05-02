
// = 001 ======================================================================
// three.js サンプルの雛形。
// これは基本となる雛形サンプルなので他のサンプルよりもコメント多めになってます。
// ============================================================================

// グローバル空間を汚染しないように、無名関数で全体を囲んでおく
(() => {
    // ブラウザによる HTML のパースが終わってから初期化を開始するためにイベント
    // リスナーを使って初期化処理が開始されるようにする
    window.addEventListener('load', () => {
        // - 宣言・定義フェーズ -----------------------------------------------
        // まず最初に変数の宣言と、必要に応じた定義処理を行なっていきます。
        // 3D 系の実装を行うときに限りませんが、設定すべき項目が多岐に渡る場合は
        // できる限り「初期値を決める場所」は冒頭に集約させましょう。
        // これを好き勝手に、自由なタイミングで行うようにしてしまうと、後から自
        // 分がソースコードを見直した際に、どこでなにを定義しているのか把握する
        // のが難しくなります。
        // --------------------------------------------------------------------

        // 汎用変数の宣言
        let width = window.innerWidth;   // ブラウザのクライアント領域の幅
        let height = window.innerHeight; // ブラウザのクライアント領域の高さ
        let targetDOM = document.getElementById('webgl'); // スクリーンとして使う DOM

        // three.js 定義されているオブジェクトに関連した変数を宣言
        let scene;    // シーン
        let camera;   // カメラ
        let controls; // カメラコントロール
        let renderer; // レンダラ
        let geometry; // ジオメトリ
        let material; // マテリアル
        let box;      // ボックスメッシュ
        let directionalLight  // ディレクショナルライト（平行光源）
        let axezHelper; // 軸ヘルパーメッシュ
        let isDown = false; // マウスボタンが押されているかどうか

        // 各種パラメータを設定するために定数オブジェクトを定義
        // ※各パラメータの意味は別途説明しますので、まずは気にせずで OK
        // 大文字は定数を表している
        const CAMERA_PARAM = { // カメラに関するパラメータ
            fovy: 60,
            aspect: width / height,
            near: 0.1,
            far: 10.0,
            x: 0.0,
            y: 2.0,
            z: 5.0,
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
        };
        const RENDERER_PARAM = { // レンダラに関するパラメータ
            clearColor: 0x000000,
            width: width,
            height: height
        };
        const MATERIAL_PARAM = { // マテリアルに関するパラメータ
            color: 0xff3399,
            specular: 0xffffff
        };

        // ライトに関するパラメータの定義
        const DIRECTIONAL_LIGHT_PARAM = {
          color: 0xffffff,
          intensity: 1.0,
          x:1.0,
          y:1.0,
          z:1.0
        };

        // 環境光に関するパラメータ
        const AMBIENT_LIGHT_PARAM = {
          color: 0xaa22ee,
          intensity: 0.5
        };

        // - 初期化フェーズ ---------------------------------------------------

        // . シーンの初期化 ...................................................
        scene = new THREE.Scene();

        // . カメラの初期化 ...................................................
        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAM.fovy,
            CAMERA_PARAM.aspect,
            CAMERA_PARAM.near,
            CAMERA_PARAM.far
        );
        camera.position.x = CAMERA_PARAM.x;
        camera.position.y = CAMERA_PARAM.y;
        camera.position.z = CAMERA_PARAM.z;
        camera.lookAt(CAMERA_PARAM.lookAt);

        // . レンダラの初期化 .................................................
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
        // divのなかに追加している
        targetDOM.appendChild(renderer.domElement);

        // 第１引数：コントロールする対象のカメラ
        // 第２引数：どのDOMからイベントを取得するか
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        // . ジオメトリとマテリアルの初期化 ...................................

        // THREE.BoxGeometry1 = キューブ型のジオメトリ
        geometry = new THREE.BoxGeometry(2.0, 2.0, 1.0);
        // Lambertマテリアルを割り当てる
        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);

        // . メッシュの初期化 .................................................
        box = new THREE.Mesh(geometry, material);

        // - 描画フェーズ -----------------------------------------------------

        // シーンにボックスメッシュを追加する
        // 3次元空間上に配置している
        scene.add(box);

        // Directional Light の設定
        // directionalLight を初期化
        directionalLight = new THREE.DirectionalLight(
          DIRECTIONAL_LIGHT_PARAM.color,
          DIRECTIONAL_LIGHT_PARAM.intensity
        );
        directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
        directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
        directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;

        // DirectionalLight を追加
        scene.add(directionalLight);

        // 環境光を追加する
        ambientLight = new THREE.AmbientLight(
          AMBIENT_LIGHT_PARAM.color,
          AMBIENT_LIGHT_PARAM.intensity
        )
        scene.add(ambientLight);

        // 軸ヘルパーを追加する
        axesHelper = new THREE.AxesHelper(10.0);
        scene.add(axesHelper);

        // レンダリンググループを定義 --------------
        let run = true;
        // キーダウンのイベントを登録
        // エスケープキーを入力するとループが止まるようにしておく
        window.addEventListener('keydown', (eve) => {
          run = eve.key !== 'Escape';
        }, false);

        // マウスイベントを追加する
        // マウスの移動に対して回転させる
        window.addEventListener('mousemove', (eve) => {
          let horizontal = (eve.clientX / width -0.5) * 2.0;
          let vertical = -(eve.clientY / height -0.5) * 2.0;

          // 求めた移動量をボックスの座標に反映
          box.position.x = horizontal;
          box.position.y = vertical;
        }, false);

        // マウスダウンイベント
        window.addEventListener('mousedown', () => {
          // ボタンを離したときにフラグを立てる
          isDown = true;
        }, false);

        // マウスアップイベント
        window.addEventListener('mouseup', () => {
          // ボタンを離したときにフラグを折る
          isDown = false;
        }, false);

        render();
        function render(){
          // render loop
          // requestAnimationFrame
          // ブラウザのリフレッシュレートに応じて自動的に最適な間隔で
          // 処理を呼び出してくれる関数
          if(run){requestAnimationFrame(render);}

          // マウスボタンを押している状態のときはボックスを回転させる
          if (isDown){
            // Y軸回転
            // box mesh はObject3D クラスに属するので
            // rotation メンバーを持っている
            box.rotation.y += 0.02;
          }

          //rendering
          renderer.render(scene, camera);
        }

    }, false);
})();
