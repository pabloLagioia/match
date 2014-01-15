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
	
	}

?>