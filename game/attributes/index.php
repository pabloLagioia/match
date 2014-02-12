<?php

	require_once($_SERVER['DOCUMENT_ROOT'] . "paths.php");

	import("editor.utils");

	if ( array_key_exists("get", $_GET) ) {
	
		$list = explode(",", $_GET["get"]);
		
		for ( $i = 0; $i < count($list); $i++ ) {

			$manifest = $list[$i] . ".json";
			$file = $list[$i] . ".js";
		
			if ( file_exists($manifest) ) {
		
				echo file_get_contents($file);
			
			}

		}
	
	} else {

?>

<!DOCTYPE>
<html>
	<head>

		<meta http-equiv="content-type" content="text/html; charset=utf-8">

		<title>Registered Game Attributes</title>

		<?php libraries() ?>
		<?php bundle("footer") ?>
		<?php bundle("header") ?>

		<link rel="stylesheet" href="../style.css"/>

		<script src="../main.js"></script>

	</head>
	<body>

		<div id="main-wrapper">

			<header>

				<?php widget("header") ?>

			</header>

	<?php

		


		$dir = new DirectoryIterator(dirname("."));

		echo "<h1>Registered Attributes</h1>";
		
		echo "<ul class='registered'>";

		foreach ($dir as $fileinfo) {

		    if (!$fileinfo->isDot() && $fileinfo->getExtension() == "json" && file_exists(str_replace("json", "js", $fileinfo->getFilename()))) {

		    	$json = json_decode(file_get_contents($fileinfo->getFilename()), true);

		    	echo "<li class='item'>";

		    	echo "<h2 class='name'>" . $json["name"] . "</h2>";
				
				echo "<div class='data hidden'>";
				
		    	echo "<h3>Description</h3>";
		    	echo "<p class='inner-prop description'>" . $json["description"] . "</p>";
		    	echo "<h3>Fields</h3>";
				
				if ( !array_key_exists('fields', $json) || sizeof($json["fields"]) == 0 ) {

					echo "<p class='inner-prop'>This attribute is a value in itself and doesn't have any fields</p>";
					
				} else {
		    	
					echo "<ul class='inner-prop fields'>";

					foreach ($json["fields"] as $key => $value) {
						echo "<li>";
						echo "<h4>" . $key . "</h4>";
						echo "<p>" . $value . "</p>";
						echo "</li>";
					}

					echo "</ul>";
				
				}
				
				echo "<h3>Methods</h3>";
				
				if ( !array_key_exists('methods', $json) || sizeof($json["methods"]) == 0 ) {
				
					echo "<p class='inner-prop'>This attribute doesn't have any methods</p>";
				
				} else {
				
					echo "<ul class='inner-prop methods'>";

					foreach ($json["methods"] as $key => $value) {
						echo "<h4>" . $key . "</h4>";
						echo "<p>" . $value . "</p>";
					}

					echo "</ul>";
				
				}

				echo "</div>";

		    	echo "</li>";


		    }
		}

		echo "</ul>"

	?>
			<?php widget("footer"); ?>

		</div>

	</body>
</html>

<?php

}

?>