
<?php

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
			<title>Registered Game Behaviours</title>
			<link rel="stylesheet" href="../style.css"/>
			<script src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
			<script src="../main.js"></script>
		</head>
		<body>

		<?php

			$dir = new DirectoryIterator(dirname("."));

			echo "<h1>Registered Behaviours</h1>";
			
			echo "<ul class='registered'>";

			foreach ($dir as $fileinfo) {

				if (!$fileinfo->isDot() && $fileinfo->getExtension() == "json" && file_exists(str_replace("json", "js", $fileinfo->getFilename()))) {

					$json = json_decode(file_get_contents($fileinfo->getFilename()), true);

					echo "<li class='item'>";

					echo "<h2 class='name'>" . $json["name"] . "</h2>";
					
					echo "<div class='data hidden'>";
					
					echo "<h3>Description</h3>";
					
					echo "<p class='inner-prop description'>" . $json["description"] . "</p>";
					echo "<h3>Attributes required</h3>";
					
					if ( !array_key_exists('requires', $json) || sizeof($json["requires"]) == 0 ) {

						echo "<p class='inner-prop'>No attributes required</p>";
					
					} else {

						echo "<ul class='inner-prop requires'>";
					
						foreach ($json["requires"] as $key => $value) {
							echo "<li>" . $value . "</li>";
						}
					
						echo "</ul>";
						
					}
					
					echo "</div>";

					echo "</li>";


				}
			}

			echo "</ul>"

		?>

		</body>
	</html>

<?php
	
	}

?>